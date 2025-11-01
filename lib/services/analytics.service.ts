/**
 * Analytics Service
 * 
 * Business logic layer for analytics and reporting.
 * Aggregates data from multiple repositories for insights.
 */

import { cache } from 'react';
import { UserRepository } from '@/lib/repositories/user.repository';
import { CourseRepository } from '@/lib/repositories/course.repository';
import { EnrollmentRepository } from '@/lib/repositories/enrollment.repository';
import { PaymentRepository } from '@/lib/repositories/payment.repository';
import { StudentRepository } from '@/lib/repositories/student.repository';
import { TeacherRepository } from '@/lib/repositories/teacher.repository';

export class AnalyticsService {
  /**
   * Get admin dashboard overview
   * Comprehensive statistics for admin portal
   */
  static getAdminDashboardOverview = cache(async () => {
    // Parallel fetch all statistics
    const [
      userStats,
      paymentStats,
      studentCount,
      teacherCount,
      recentUsers,
      recentPayments,
    ] = await Promise.all([
      UserRepository.getUserStatsByRole(),
      PaymentRepository.getPaymentStats(),
      StudentRepository.getTotalStudentsCount(),
      TeacherRepository.getTotalTeachersCount(),
      UserRepository.getRecentUsers(10),
      PaymentRepository.getRecentPayments(10),
    ]);

    return {
      users: userStats,
      payments: paymentStats,
      counts: {
        students: studentCount,
        teachers: teacherCount,
      },
      recent: {
        users: recentUsers,
        payments: recentPayments,
      },
    };
  });

  /**
   * Get platform-wide statistics
   */
  static getPlatformStats = cache(async () => {
    // Parallel fetch all counts
    const [
      totalUsers,
      activeUsers,
      totalStudents,
      totalTeachers,
      paymentStats,
    ] = await Promise.all([
      UserRepository.getTotalUsersCount(),
      UserRepository.getActiveUsersCount(),
      StudentRepository.getTotalStudentsCount(),
      TeacherRepository.getTotalTeachersCount(),
      PaymentRepository.getPaymentStats(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        students: totalStudents,
        teachers: totalTeachers,
      },
      payments: paymentStats,
    };
  });

  /**
   * Get enrollment analytics
   */
  static getEnrollmentAnalytics = cache(async () => {
    // This would aggregate enrollment data across all courses
    // For now, returning placeholder structure
    return {
      totalEnrollments: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      avgCompletionRate: 0,
      enrollmentTrend: [],
    };
  });

  /**
   * Get revenue analytics
   */
  static getRevenueAnalytics = cache(async () => {
    const paymentStats = await PaymentRepository.getPaymentStats();

    const totalRevenue = parseFloat(paymentStats.totalAmount?.toString() || '0');
    const pendingRevenue = parseFloat(paymentStats.pendingAmount?.toString() || '0');

    return {
      totalRevenue,
      pendingRevenue,
      completedPayments: paymentStats.completedPayments,
      pendingPayments: paymentStats.pendingPayments,
      avgPaymentValue: paymentStats.completedPayments > 0 
        ? totalRevenue / paymentStats.completedPayments 
        : 0,
    };
  });

  /**
   * Get course performance analytics
   */
  static getCoursePerformanceAnalytics = cache(async (courseId: string) => {
    // Parallel fetch course stats
    const [stats, enrollmentCount, activeCount] = await Promise.all([
      CourseRepository.getCourseStats(courseId),
      EnrollmentRepository.getEnrollmentCount(courseId),
      CourseRepository.getActiveEnrollmentCount(courseId),
    ]);

    const completionRate = stats.totalEnrollments > 0 
      ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100) 
      : 0;

    return {
      ...stats,
      enrollmentCount,
      activeCount,
      completionRate,
    };
  });

  /**
   * Get teacher performance analytics
   */
  static getTeacherPerformanceAnalytics = cache(async (teacherId: string) => {
    const stats = await TeacherRepository.getTeacherStats(teacherId);

    const courseCompletionRate = stats.totalCourses > 0 
      ? Math.round((stats.activeCourses / stats.totalCourses) * 100) 
      : 0;

    const avgStudentsPerCourse = stats.activeCourses > 0 
      ? Math.round(stats.totalStudents / stats.activeCourses) 
      : 0;

    return {
      ...stats,
      courseCompletionRate,
      avgStudentsPerCourse,
    };
  });

  /**
   * Get student performance analytics
   */
  static getStudentPerformanceAnalytics = cache(async (studentId: string) => {
    const stats = await StudentRepository.getStudentStats(studentId);

    const completionRate = stats.totalEnrollments > 0 
      ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100) 
      : 0;

    return {
      ...stats,
      completionRate,
    };
  });
}
