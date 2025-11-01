/**
 * Category Service
 * 
 * Business logic layer for course category operations.
 */

import { cache } from 'react';
import { CategoryRepository } from '@/lib/repositories/category.repository';

export class CategoryService {
  /**
   * Get all categories for admin page
   */
  static getAllCategories = cache(async () => {
    return CategoryRepository.getAllCategories();
  });

  /**
   * Get active categories for public use
   */
  static getActiveCategories = cache(async () => {
    return CategoryRepository.getActiveCategories();
  });

  /**
   * Get category by ID
   */
  static getCategoryById = cache(async (id: string) => {
    return CategoryRepository.getCategoryById(id);
  });

  /**
   * Get category by slug
   */
  static getCategoryBySlug = cache(async (slug: string) => {
    return CategoryRepository.getCategoryBySlug(slug);
  });
}
