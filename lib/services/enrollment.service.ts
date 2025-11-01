/**
 * Enrollment Service
 * 
 * Business logic layer for enrollment-related operations.
 */

import { cache } from 'react';
import { EnrollmentRepository } from '@/lib/repositories/enrollment.repository';
import { CourseRepository } from '@/lib/repositories/course.repository';

export class EnrollmentService {
  /**
   * Get student's enrollments with course details
   */
  static getStudentEnrollments = cache(async (studentId: string) => {
    return await EnrollmentRepository.getEnrollmentsByStudentId(studentId);
  });

  /**
   * Get enrollment details with all related data
   */
  static getEnrollmentDetails = cache(async (enrollmentId: string, studentId: string) => {
    const enrollment = await EnrollmentRepository.getEnrollmentById(enrollmentId);
    
    if (!enrollment || enrollment.studentId !== studentId) {
      return null;
    }

    // Fetch course schedules in parallel
    const schedules = await CourseRepository.getCourseSchedules(enrollment.courseId);

    return {
      ...enrollment,
      schedules,
    };
  });

  /**
   * Get student dashboard statistics
   */
  static getStudentDashboardStats = cache(async (studentId: string) => {
    // Parallel fetch all statistics
    const [
      enrollments,
      activeCount,
      completedCount,
      avgProgress,
    ] = await Promise.all([
      EnrollmentRepository.getEnrollmentsByStudentId(studentId),
      EnrollmentRepository.getActiveEnrollmentsCount(studentId),
      EnrollmentRepository.getCompletedEnrollmentsCount(studentId),
      EnrollmentRepository.getAverageProgress(studentId),
    ]);

    const totalCourses = enrollments.length;

    // Calculate payment statistics
    const totalSpent = enrollments.reduce(
      (sum, e) => sum + parseFloat(e.paidAmount || '0'),
      0
    );

    const totalOwed = enrollments.reduce(
      (sum, e) => {
        const total = parseFloat(e.totalAmount || '0');
        const paid = parseFloat(e.paidAmount || '0');
        return sum + (total - paid);
      },
      0
    );

    return {
      totalCourses,
      activeCourses: activeCount,
      completedCourses: completedCount,
      avgProgress,
      totalSpent,
      totalOwed,
    };
  });

  /**
   * Get course enrollments for teacher view
   */
  static getCourseEnrollments = cache(async (courseId: string, teacherId: string) => {
    // Verify teacher owns the course
    const course = await CourseRepository.getCourseById(courseId);
    
    if (!course || course.teacherId !== teacherId) {
      return null;
    }

    return await EnrollmentRepository.getEnrollmentsByCourseId(courseId);
  });

  /**
   * Calculate payment progress for an enrollment
   */
  static calculatePaymentProgress(totalAmount: string, paidAmount: string): number {
    const total = parseFloat(totalAmount || '0');
    const paid = parseFloat(paidAmount || '0');
    
    if (total === 0) return 0;
    
    return Math.round((paid / total) * 100);
  }

  /**
   * Calculate remaining balance for an enrollment
   */
  static calculateRemainingBalance(totalAmount: string, paidAmount: string): number {
    const total = parseFloat(totalAmount || '0');
    const paid = parseFloat(paidAmount || '0');
    
    return Math.max(0, total - paid);
  }

  /**
   * Get all enrollments with student and course details for admin page
   */
  static getAllEnrollmentsWithDetails = cache(async () => {
    return EnrollmentRepository.getAllEnrollmentsWithDetails();
  });
}
