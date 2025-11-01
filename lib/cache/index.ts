/**
 * Cache Wrapper Utilities
 * 
 * Provides convenient wrappers for caching functions
 */

import { cache } from 'react';
import { CacheService } from './redis';

/**
 * Wrap a function with caching (no parameters)
 * 
 * @param key - Cache key
 * @param fn - Function to cache
 * @param ttl - Time to live in seconds
 */
export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number
): () => Promise<T> {
  return cache(async () => {
    // Try to get from cache
    const cached = await CacheService.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Store in cache
    await CacheService.set(key, result, ttl);

    return result;
  });
}

/**
 * Wrap a function with caching (with parameters)
 * 
 * @param keyFn - Function to generate cache key from parameters
 * @param fn - Function to cache
 * @param ttl - Time to live in seconds
 */
export function withCacheParam<P, T>(
  keyFn: (param: P) => string,
  fn: (param: P) => Promise<T>,
  ttl: number
): (param: P) => Promise<T> {
  return cache(async (param: P) => {
    const key = keyFn(param);

    // Try to get from cache
    const cached = await CacheService.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn(param);

    // Store in cache
    await CacheService.set(key, result, ttl);

    return result;
  });
}

/**
 * Cache Warmer
 * Pre-loads frequently accessed data into cache
 */
export class CacheWarmer {
  /**
   * Warm dashboard caches for active users
   */
  static async warmDashboards(): Promise<void> {
    // Implementation would fetch active users and pre-load their dashboards
    // This is a placeholder for future implementation
    console.log('[Cache] Warming dashboards...');
  }

  /**
   * Warm course caches for popular courses
   */
  static async warmCourses(): Promise<void> {
    // Implementation would fetch popular courses and pre-load their data
    // This is a placeholder for future implementation
    console.log('[Cache] Warming courses...');
  }
}

// Re-export cache utilities
export { CacheService, CacheKeys, CacheTTL, CacheInvalidator } from './redis';
