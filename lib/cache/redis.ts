/**
 * Redis Cache Service using Upstash
 * 
 * Provides caching layer for improved performance
 */

import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Cache Service
 * Provides methods for caching data with Redis
 */
export class CacheService {
  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;

    try {
      const start = performance.now();
      const value = await redis.get<T>(key);
      const duration = performance.now() - start;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Cache] GET ${key}: ${value ? 'HIT' : 'MISS'} (${duration.toFixed(2)}ms)`
        );
      }

      return value;
    } catch (error) {
      console.error(`[Cache] GET ${key} error:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set(key: string, value: any, ttl: number): Promise<void> {
    if (!redis) return;

    try {
      const start = performance.now();
      await redis.setex(key, ttl, JSON.stringify(value));
      const duration = performance.now() - start;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Cache] SET ${key}: ${ttl}s TTL (${duration.toFixed(2)}ms)`
        );
      }
    } catch (error) {
      console.error(`[Cache] SET ${key} error:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  static async del(key: string): Promise<void> {
    if (!redis) return;

    try {
      const start = performance.now();
      await redis.del(key);
      const duration = performance.now() - start;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache] DEL ${key} (${duration.toFixed(2)}ms)`);
      }
    } catch (error) {
      console.error(`[Cache] DEL ${key} error:`, error);
    }
  }

  /**
   * Delete all keys matching pattern
   */
  static async delPattern(pattern: string): Promise<void> {
    if (!redis) return;

    try {
      const start = performance.now();
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      const duration = performance.now() - start;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Cache] DEL pattern ${pattern}: ${keys.length} keys (${duration.toFixed(2)}ms)`
        );
      }
    } catch (error) {
      console.error(`[Cache] DEL pattern ${pattern} error:`, error);
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    if (!redis) return false;

    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`[Cache] EXISTS ${key} error:`, error);
      return false;
    }
  }

  /**
   * Get TTL of key
   */
  static async ttl(key: string): Promise<number> {
    if (!redis) return -1;

    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error(`[Cache] TTL ${key} error:`, error);
      return -1;
    }
  }

  /**
   * Increment value
   */
  static async incr(key: string): Promise<number> {
    if (!redis) return 0;

    try {
      return await redis.incr(key);
    } catch (error) {
      console.error(`[Cache] INCR ${key} error:`, error);
      return 0;
    }
  }

  /**
   * Set expiration time
   */
  static async expire(key: string, ttl: number): Promise<void> {
    if (!redis) return;

    try {
      await redis.expire(key, ttl);
    } catch (error) {
      console.error(`[Cache] EXPIRE ${key} error:`, error);
    }
  }
}

/**
 * Cache Keys
 * Centralized cache key generation
 */
export class CacheKeys {
  // Dashboard keys
  static studentDashboard(studentId: string) {
    return `dashboard:student:${studentId}`;
  }

  static teacherDashboard(teacherId: string) {
    return `dashboard:teacher:${teacherId}`;
  }

  static adminDashboard() {
    return 'dashboard:admin';
  }

  // Course keys
  static activeCourses() {
    return 'courses:active';
  }

  static courseDetails(courseId: string) {
    return `course:${courseId}`;
  }

  static courseStats(courseId: string) {
    return `course:${courseId}:stats`;
  }

  static teacherCourses(teacherId: string) {
    return `courses:teacher:${teacherId}`;
  }

  // Student keys
  static studentProfile(studentId: string) {
    return `student:${studentId}`;
  }

  static studentEnrollments(studentId: string) {
    return `enrollments:student:${studentId}`;
  }

  // Teacher keys
  static teacherProfile(teacherId: string) {
    return `teacher:${teacherId}`;
  }

  // Analytics keys
  static platformStats() {
    return 'analytics:platform';
  }

  static enrollmentAnalytics() {
    return 'analytics:enrollments';
  }

  static revenueAnalytics() {
    return 'analytics:revenue';
  }
}

/**
 * Cache TTL Constants (in seconds)
 */
export class CacheTTL {
  static readonly SHORT = 60;        // 1 minute - Frequently changing
  static readonly MEDIUM = 300;      // 5 minutes - Moderately changing
  static readonly LONG = 1800;       // 30 minutes - Rarely changing
  static readonly VERY_LONG = 3600;  // 1 hour - Static data
  static readonly DAY = 86400;       // 24 hours - Very static
}

/**
 * Cache Invalidator
 * Handles cache invalidation for different entities
 */
export class CacheInvalidator {
  /**
   * Invalidate course-related caches
   */
  static async invalidateCourse(courseId: string): Promise<void> {
    await Promise.all([
      CacheService.del(CacheKeys.courseDetails(courseId)),
      CacheService.del(CacheKeys.courseStats(courseId)),
      CacheService.del(CacheKeys.activeCourses()),
    ]);
  }

  /**
   * Invalidate student-related caches
   */
  static async invalidateStudent(studentId: string): Promise<void> {
    await Promise.all([
      CacheService.del(CacheKeys.studentDashboard(studentId)),
      CacheService.del(CacheKeys.studentProfile(studentId)),
      CacheService.del(CacheKeys.studentEnrollments(studentId)),
    ]);
  }

  /**
   * Invalidate teacher-related caches
   */
  static async invalidateTeacher(teacherId: string): Promise<void> {
    await Promise.all([
      CacheService.del(CacheKeys.teacherDashboard(teacherId)),
      CacheService.del(CacheKeys.teacherProfile(teacherId)),
      CacheService.del(CacheKeys.teacherCourses(teacherId)),
    ]);
  }

  /**
   * Invalidate analytics caches
   */
  static async invalidateAnalytics(): Promise<void> {
    await Promise.all([
      CacheService.del(CacheKeys.platformStats()),
      CacheService.del(CacheKeys.enrollmentAnalytics()),
      CacheService.del(CacheKeys.revenueAnalytics()),
      CacheService.del(CacheKeys.adminDashboard()),
    ]);
  }

  /**
   * Invalidate all caches
   */
  static async invalidateAll(): Promise<void> {
    await CacheService.delPattern('*');
  }
}
