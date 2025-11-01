/**
 * Course Service
 * 
 * Business logic layer for course-related operations.
 * Orchestrates data from multiple repositories and adds business rules.
 */

import { cache } from 'react';
import { CourseRepository } from '@/lib/repositories/course.repository';
import { EnrollmentRepository } from '@/lib/repositories/enrollment.repository';

export class CourseService {
  /**
   * Get all active courses with enrollment counts
   * Uses parallel fetching for optimal performance
   */
  static getCoursesWithStats = cache(async () => {
    const courses = await CourseRepository.getActiveCourses();
    
    // Parallel fetch enrollment counts for all courses
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await EnrollmentRepository.getEnrollmentCount(course.id);
        return {
          ...course,
          enrollmentCount,
        };
      })
    );

    return coursesWithStats;
  });

  /**
   * Get course details with all related data
   * Fetches course, stats, schedules, and enrollment status in parallel
   */
  static getCourseDetails = cache(async (courseId: string, userId?: string) => {
    // Parallel fetch all related data
    const [course, stats, schedules, isEnrolled] = await Promise.all([
      CourseRepository.getCourseById(courseId),
      CourseRepository.getCourseStats(courseId),
      CourseRepository.getCourseSchedules(courseId),
      userId ? EnrollmentRepository.isUserEnrolled(userId, courseId) : Promise.resolve(false),
    ]);

    if (!course) {
      return null;
    }

    return {
      course,
      stats,
      schedules,
      isEnrolled,
    };
  });

  /**
   * Get teacher's courses with statistics
   * Optimized with parallel fetching
   */
  static getTeacherCoursesWithStats = cache(async (teacherId: string) => {
    const courses = await CourseRepository.getCoursesByTeacherId(teacherId);
    
    // Parallel fetch enrollment count for all courses
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await EnrollmentRepository.getEnrollmentCount(course.id);
        
        return {
          ...course,
          enrollmentCount,
        };
      })
    );

    return coursesWithStats;
  });

  /**
   * Get teacher dashboard statistics
   */
  static getTeacherDashboardStats = cache(async (teacherId: string) => {
    const courses = await CourseRepository.getCoursesByTeacherId(teacherId);
    
    // Parallel fetch stats for all courses
    const allStats = await Promise.all(
      courses.map((course) => CourseRepository.getCourseStats(course.id))
    );

    // Aggregate statistics
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.isActive).length;
    const totalEnrollments = allStats.reduce((sum, stat) => sum + stat.totalEnrollments, 0);
    const activeEnrollments = allStats.reduce((sum, stat) => sum + stat.activeEnrollments, 0);
    const completedEnrollments = allStats.reduce((sum, stat) => sum + stat.completedEnrollments, 0);

    return {
      totalCourses,
      activeCourses,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
    };
  });

  /**
   * Get course with enrollment details for a specific student
   */
  static getCourseForStudent = cache(async (courseId: string, studentId: string) => {
    // Parallel fetch course and enrollment status
    const [course, isEnrolled] = await Promise.all([
      CourseRepository.getCourseById(courseId),
      EnrollmentRepository.isUserEnrolled(studentId, courseId),
    ]);

    if (!course) {
      return null;
    }

    return {
      ...course,
      isEnrolled,
    };
  });
}
