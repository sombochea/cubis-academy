/**
 * Redis Cache Client
 * 
 * Provides caching layer for frequently accessed data
 * with automatic serialization and TTL management.
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client (using Upstash for serverless compatibility)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Cache service with automatic serialization
 */
export class CacheService {
  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    if (!redis) {
      console.warn('[Cache] Redis not configured, skipping cache');
      return null;
    }

    try {
      const start = performance.now();
      const cached = await redis.get(key);
      const duration = performance.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache] GET ${key}: ${cached ? 'HIT' : 'MISS'} (${duration.toFixed(2)}ms)`);
      }
      
      return cached as T | null;
    } catch (error) {
      console.error('[Cache] GET error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set(key: string, data: any, ttl: number = 300): Promise<void> {
    if (!redis) {
      return;
    }

    try {
      const start = performance.now();
      await redis.setex(key, ttl, JSON.stringify(data));
      const duration = performance.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache] SET ${key}: ${ttl}s TTL (${duration.toFixed(2)}ms)`);
      }
    } catch (error) {
      console.error('[Cache] SET error:', error);
    }
  }

  /**
   * Delete value from cache
   */
  static async del(key: string): Promise<void> {
    if (!redis) {
      return;
    }

    try {
      await redis.del(key);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache] DEL ${key}`);
      }
    } catch (error) {
      console.error('[Cache] DEL error:', error);
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  static async delPattern(pattern: string): Promise<void> {
    if (!redis) {
      return;
    }

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Cache] DEL pattern ${pattern}: ${keys.length} keys`);
        }
      }
    } catch (error) {
      console.error('[Cache] DEL pattern error:', error);
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    if (!redis) {
      return false;
    }

    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('[Cache] EXISTS error:', error);
      return false;
    }
  }

  /**
   * Get remaining TTL for key
   */
  static async ttl(key: string): Promise<number> {
    if (!redis) {
      return -1;
    }

    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error('[Cache] TTL error:', error);
      return -1;
    }
  }

  /**
   * Increment counter
   */
  static async incr(key: string): Promise<number> {
    if (!redis) {
      return 0;
    }

    try {
      return await redis.incr(key);
    } catch (error) {
      console.error('[Cache] INCR error:', error);
      return 0;
    }
  }

  /**
   * Set expiration on existing key
   */
  static async expire(key: string, ttl: number): Promise<void> {
    if (!redis) {
      return;
    }

    try {
      await redis.expire(key, ttl);
    } catch (error) {
      console.error('[Cache] EXPIRE error:', error);
    }
  }
}

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  // Dashboard caches
  studentDashboard: (studentId: string) => `dashboard:student:${studentId}`,
  teacherDashboard: (teacherId: string) => `dashboard:teacher:${teacherId}`,
  adminDashboard: () => 'dashboard:admin',

  // Course caches
  activeCourses: () => 'courses:active',
  courseDetails: (courseId: string) => `course:${courseId}`,
  courseStats: (courseId: string) => `course:${courseId}:stats`,
  teacherCourses: (teacherId: string) => `courses:teacher:${teacherId}`,

  // Student caches
  studentProfile: (studentId: string) => `student:${studentId}`,
  studentEnrollments: (studentId: string) => `enrollments:student:${studentId}`,
  studentStats: (studentId: string) => `stats:student:${studentId}`,

  // Teacher caches
  teacherProfile: (teacherId: string) => `teacher:${teacherId}`,
  teacherStats: (teacherId: string) => `stats:teacher:${teacherId}`,

  // Analytics caches
  platformStats: () => 'analytics:platform',
  enrollmentAnalytics: () => 'analytics:enrollments',
  revenueAnalytics: () => 'analytics:revenue',

  // Pattern matchers for bulk invalidation
  patterns: {
    allDashboards: () => 'dashboard:*',
    allCourses: () => 'courses:*',
    allStudents: () => 'student:*',
    allTeachers: () => 'teacher:*',
    allAnalytics: () => 'analytics:*',
    userDashboard: (userId: string) => `dashboard:*:${userId}`,
  },
};

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  SHORT: 60,           // 1 minute - frequently changing data
  MEDIUM: 300,         // 5 minutes - moderately changing data
  LONG: 1800,          // 30 minutes - rarely changing data
  VERY_LONG: 3600,     // 1 hour - static data
  DAY: 86400,          // 24 hours - very static data
};

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  /**
   * Warm dashboard caches for active users
   */
  static async warmDashboards(): Promise<void> {
    if (!redis) {
      return;
    }

    console.log('[Cache] Warming dashboard caches...');
    
    // This would be called by a cron job or background task
    // Implementation depends on your user activity tracking
  }

  /**
   * Warm course caches
   */
  static async warmCourses(): Promise<void> {
    if (!redis) {
      return;
    }

    console.log('[Cache] Warming course caches...');
    
    // Pre-load popular courses
    // Implementation depends on your course popularity tracking
  }
}

/**
 * Cache invalidation utilities
 */
export class CacheInvalidator {
  /**
   * Invalidate all caches related to a course
   */
  static async invalidateCourse(courseId: string): Promise<void> {
    await Promise.all([
      CacheService.del(CacheKeys.courseDetails(courseId)),
      CacheService.del(CacheKeys.courseStats(courseId)),
      CacheService.del(CacheKeys.activeCourses()),
    ]);
  }

  /**
   * Invalidate all caches related to a student
   */
  static async invalidateStudent(studentId: string): Promise<void> {
    await Promise.all([
      CacheService.del(CacheKeys.studentDashboard(studentId)),
      CacheService.del(CacheKeys.studentProfile(studentId)),
      CacheService.del(CacheKeys.studentEnrollments(studentId)),
      CacheService.del(CacheKeys.studentStats(studentId)),
    ]);
  }

  /**
   * Invalidate all caches related to a teacher
   */
  static async invalidateTeacher(teacherId: string): Promise<void> {
    await Promise.all([
      CacheService.del(CacheKeys.teacherDashboard(teacherId)),
      CacheService.del(CacheKeys.teacherProfile(teacherId)),
      CacheService.del(CacheKeys.teacherStats(teacherId)),
      CacheService.delPattern(CacheKeys.patterns.userDashboard(teacherId)),
    ]);
  }

  /**
   * Invalidate all analytics caches
   */
  static async invalidateAnalytics(): Promise<void> {
    await CacheService.delPattern(CacheKeys.patterns.allAnalytics());
  }

  /**
   * Invalidate all caches (use sparingly!)
   */
  static async invalidateAll(): Promise<void> {
    console.warn('[Cache] Invalidating ALL caches');
    await Promise.all([
      CacheService.delPattern('*'),
    ]);
  }
}
