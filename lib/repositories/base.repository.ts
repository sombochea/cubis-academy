/**
 * Base Repository
 * 
 * Provides common database operations and utilities for all repositories.
 * All specific repositories should extend or use patterns from this base.
 */

import { db } from '@/lib/drizzle/db';
import { sql } from 'drizzle-orm';

export class BaseRepository {
  /**
   * Execute a raw SQL query with performance logging
   */
  protected static async executeQuery<T>(
    name: string,
    query: () => Promise<T>
  ): Promise<T> {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      const result = await query();
      const duration = performance.now() - start;
      console.log(`[Query] ${name}: ${duration.toFixed(2)}ms`);
      return result;
    }
    return query();
  }

  /**
   * Get database instance
   */
  protected static get database() {
    return db;
  }

  /**
   * Count records in a table with optional conditions
   */
  protected static async count(
    table: any,
    conditions?: any
  ): Promise<number> {
    const query = conditions
      ? db.select({ count: sql<number>`count(*)` }).from(table).where(conditions)
      : db.select({ count: sql<number>`count(*)` }).from(table);

    const [result] = await query;
    return result?.count || 0;
  }

  /**
   * Check if a record exists
   */
  protected static async exists(
    table: any,
    conditions: any
  ): Promise<boolean> {
    const count = await this.count(table, conditions);
    return count > 0;
  }
}
