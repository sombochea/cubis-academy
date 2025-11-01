/**
 * Cached Enrollment Repository
 * 
 * Enhanced version of EnrollmentRepository with Redis caching layer.
 */

import { EnrollmentRepository } from './enrollment.repository';
import { withCacheParam, CacheKeys, CacheTTL } from '@/lib/cache';

export class CachedEnrollmentRepository extends EnrollmentRepository {
  /**
   * Get enrollments by student with caching
   * Cache for 5 minutes (enrollments change with activity)
   */
  static getEnrollmentsByStudentId = withCacheParam(
    (studentId: string) => CacheKeys.studentEnrollments(studentId),
    (studentId: string) => EnrollmentRepository.getEnrollmentsByStudentId(studentId),
    CacheTTL.MEDIUM
  );

  /**
   * Get enrollments by course with caching
   * Cache for 5 minutes
   */
  static getEnrollmentsByCourseId = withCacheParam(
    (courseId: string) => `enrollments:course:${courseId}`,
    (courseId: string) => EnrollmentRepository.getEnrollmentsByCourseId(courseId),
    CacheTTL.MEDIUM
  );

  /**
   * Get enrollment count with caching
   * Cache for 5 minutes
   */
  static getEnrollmentCount = withCacheParam(
    (courseId: string) => `enrollments:count:${courseId}`,
    (courseId: string) => EnrollmentRepository.getEnrollmentCount(courseId),
    CacheTTL.MEDIUM
  );
}
