/**
 * Category Repository
 * 
 * Data access layer for course category operations.
 */

import { cache } from 'react';
import { db } from '@/lib/drizzle/db';
import { courseCategories } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { BaseRepository } from './base.repository';

export class CategoryRepository extends BaseRepository {
  /**
   * Get all categories
   */
  static getAllCategories = cache(async () => {
    return await this.executeQuery('getAllCategories', async () => {
      return await db
        .select()
        .from(courseCategories)
        .orderBy(courseCategories.name);
    });
  });

  /**
   * Get category by ID
   */
  static getCategoryById = cache(async (id: string) => {
    return await this.executeQuery(`getCategoryById:${id}`, async () => {
      const [category] = await db
        .select()
        .from(courseCategories)
        .where(eq(courseCategories.id, id));
      
      return category;
    });
  });

  /**
   * Get category by slug
   */
  static getCategoryBySlug = cache(async (slug: string) => {
    return await this.executeQuery(`getCategoryBySlug:${slug}`, async () => {
      const [category] = await db
        .select()
        .from(courseCategories)
        .where(eq(courseCategories.slug, slug));
      
      return category;
    });
  });

  /**
   * Get active categories
   */
  static getActiveCategories = cache(async () => {
    return await this.executeQuery('getActiveCategories', async () => {
      return await db
        .select()
        .from(courseCategories)
        .where(eq(courseCategories.isActive, true))
        .orderBy(courseCategories.name);
    });
  });
}
