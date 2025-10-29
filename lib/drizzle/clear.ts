import 'dotenv/config';
import { db } from './db';
import { users, students, teachers, courses, enrollments, payments, scores, attendances } from './schema';

async function clear() {
  console.log('🗑️  Clearing database...');

  try {
    // Delete in correct order to respect foreign key constraints
    console.log('Deleting attendances...');
    await db.delete(attendances);
    
    console.log('Deleting scores...');
    await db.delete(scores);
    
    console.log('Deleting payments...');
    await db.delete(payments);
    
    console.log('Deleting enrollments...');
    await db.delete(enrollments);
    
    console.log('Deleting courses...');
    await db.delete(courses);
    
    console.log('Deleting students...');
    await db.delete(students);
    
    console.log('Deleting teachers...');
    await db.delete(teachers);
    
    console.log('Deleting users...');
    await db.delete(users);

    console.log('✅ Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clear();
