/**
 * Cached Teacher Repository
 * 
 * Enhanced version of TeacherRepository with Redis caching layer.
 */

import { TeacherRepository } from './teacher.repository';
import { withCache, withCacheParam, CacheKeys, CacheTTL } from '@/lib/cache';

export class CachedTeacherRepository extends TeacherRepository {
  /**
   * Get teacher by user ID with caching
   * Cache for 30 minutes (profiles rarely change)
   */
  static getTeacherByUserId = withCacheParam(
    (userId: string) => CacheKeys.teacherProfile(userId),
    (userId: string) => TeacherRepository.getTeacherByUserId(userId),
    CacheTTL.LONG
  );

  /**
   * Get all teachers with stats (admin view)
   * Cache for 5 minutes
   */
  static getAllTeachersWithStats = withCache(
    'teachers:all:stats',
    () => TeacherRepository.getAllTeachersWithStats(),
    CacheTTL.MEDIUM
  );

  /**
   * Get teacher stats with caching
   * Cache for 5 minutes
   */
  static getTeacherStats = withCacheParam(
    (userId: string) => CacheKeys.teacherStats(userId),
    (userId: string) => TeacherRepository.getTeacherStats(userId),
    CacheTTL.MEDIUM
  );
}
