import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const { Pool } = pg;

async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    console.log('🔧 Initializing database extensions and functions...\n');

    // Read the setup SQL file
    const setupSql = readFileSync(
      join(process.cwd(), 'lib/drizzle/setup-extensions.sql'),
      'utf-8'
    );

    // Execute the setup SQL
    await pool.query(setupSql);

    console.log('✅ Extensions enabled:');
    console.log('   - uuid-ossp');
    console.log('   - pgcrypto');
    console.log('\n✅ Functions created:');
    console.log('   - uuid_generate_v7()');

    // Test the function
    const testResult = await pool.query('SELECT uuid_generate_v7() as sample_uuid_v7');
    
    if (testResult.rows && testResult.rows.length > 0) {
      const sampleUuid = testResult.rows[0].sample_uuid_v7;
      console.log('\n🧪 Test UUID v7:', sampleUuid);
      
      // Verify it's UUID v7 (check version bit)
      const versionChar = sampleUuid.charAt(14);
      if (versionChar === '7') {
        console.log('✅ UUID v7 verified (version bit = 7)');
      } else {
        console.log(`⚠️  Warning: Expected version 7, got ${versionChar}`);
      }
    }

    console.log('\n🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
