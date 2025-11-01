/**
 * Cached Student Repository
 * 
 * Enhanced version of StudentRepository with Redis caching layer.
 */

import { StudentRepository } from './student.repository';
import { withCache, withCacheParam, CacheKeys, CacheTTL } from '@/lib/cache';

export class CachedStudentRepository extends StudentRepository {
  /**
   * Get student by user ID with caching
   * Cache for 30 minutes (profiles rarely change)
   */
  static getStudentByUserId = withCacheParam(
    (userId: string) => CacheKeys.studentProfile(userId),
    (userId: string) => StudentRepository.getStudentByUserId(userId),
    CacheTTL.LONG
  );

  /**
   * Get all students with stats (admin view)
   * Cache for 5 minutes
   */
  static getAllStudentsWithStats = withCache(
    'students:all:stats',
    () => StudentRepository.getAllStudentsWithStats(),
    CacheTTL.MEDIUM
  );

  /**
   * Get student stats with caching
   * Cache for 5 minutes (stats change with activity)
   */
  static getStudentStats = withCacheParam(
    (userId: string) => CacheKeys.studentStats(userId),
    (userId: string) => StudentRepository.getStudentStats(userId),
    CacheTTL.MEDIUM
  );

  /**
   * Get students by course with caching
   * Cache for 5 minutes
   */
  static getStudentsByCourseId = withCacheParam(
    (courseId: string) => `students:course:${courseId}`,
    (courseId: string) => StudentRepository.getStudentsByCourseId(courseId),
    CacheTTL.MEDIUM
  );
}
