/**
 * Cache Wrapper Utilities
 * 
 * Provides easy-to-use wrappers for caching function results
 */

import { cache } from 'react';
import { CacheService, CacheKeys, CacheTTL } from './redis';

/**
 * Wrap a function with Redis caching
 * Falls back to function execution if cache is unavailable
 */
export function withCache<T>(
  cacheKey: string,
  fn: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM
): () => Promise<T> {
  return cache(async () => {
    // Try to get from cache
    const cached = await CacheService.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Store in cache (fire and forget)
    CacheService.set(cacheKey, result, ttl).catch(err => {
      console.error('[Cache] Failed to cache result:', err);
    });

    return result;
  });
}

/**
 * Wrap a function with Redis caching (with parameters)
 */
export function withCacheParam<T, P extends any[]>(
  keyGenerator: (...args: P) => string,
  fn: (...args: P) => Promise<T>,
  ttl: number = CacheTTL.MEDIUM
): (...args: P) => Promise<T> {
  return cache(async (...args: P) => {
    const cacheKey = keyGenerator(...args);

    // Try to get from cache
    const cached = await CacheService.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn(...args);

    // Store in cache (fire and forget)
    CacheService.set(cacheKey, result, ttl).catch(err => {
      console.error('[Cache] Failed to cache result:', err);
    });

    return result;
  });
}

/**
 * Cache decorator for class methods
 */
export function Cached(ttl: number = CacheTTL.MEDIUM) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await CacheService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await CacheService.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

// Re-export cache utilities
export { CacheService, CacheKeys, CacheTTL, CacheWarmer, CacheInvalidator } from './redis';
