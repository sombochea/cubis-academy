/**
 * Cached Course Repository
 * 
 * Enhanced version of CourseRepository with Redis caching layer.
 * Falls back to direct database queries if Redis is unavailable.
 */

import { cache } from 'react';
import { CourseRepository } from './course.repository';
import { withCache, withCacheParam, CacheKeys, CacheTTL } from '@/lib/cache';

export class CachedCourseRepository extends CourseRepository {
  /**
   * Get all active courses with caching
   * Cache for 5 minutes (courses don't change frequently)
   */
  static getActiveCourses = withCache(
    CacheKeys.activeCourses(),
    () => CourseRepository.getActiveCourses(),
    CacheTTL.MEDIUM
  );

  /**
   * Get course by ID with caching
   * Cache for 30 minutes (individual courses rarely change)
   */
  static getCourseById = withCacheParam(
    (courseId: string) => CacheKeys.courseDetails(courseId),
    (courseId: string) => CourseRepository.getCourseById(courseId),
    CacheTTL.LONG
  );

  /**
   * Get course stats with caching
   * Cache for 5 minutes (stats change with enrollments)
   */
  static getCourseStats = withCacheParam(
    (courseId: string) => CacheKeys.courseStats(courseId),
    (courseId: string) => CourseRepository.getCourseStats(courseId),
    CacheTTL.MEDIUM
  );

  /**
   * Get courses by teacher with caching
   * Cache for 5 minutes
   */
  static getCoursesByTeacherId = withCacheParam(
    (teacherId: string) => CacheKeys.teacherCourses(teacherId),
    (teacherId: string) => CourseRepository.getCoursesByTeacherId(teacherId),
    CacheTTL.MEDIUM
  );
}
