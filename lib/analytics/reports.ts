/**
 * Analytics & Reporting Service
 * 
 * Provides advanced analytics, data export, and custom reporting capabilities.
 */

import { db } from '@/lib/drizzle/db';
import {
  courses,
  enrollments,
  payments,
  scores,
  attendances,
  users,
  students,
  teachers,
} from '@/lib/drizzle/schema';
import { sql, eq, and, gte, lte, desc, count } from 'drizzle-orm';
import { cache } from 'react';

/**
 * Time range for analytics
 */
export interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Enrollment analytics data
 */
export interface EnrollmentAnalytics {
  total: number;
  active: number;
  completed: number;
  byMonth: Array<{ month: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  byLevel: Array<{ level: string; count: number }>;
  growthRate: number;
}

/**
 * Revenue analytics data
 */
export interface RevenueAnalytics {
  totalRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  averagePayment: number;
  byMonth: Array<{ month: string; amount: number }>;
  byMethod: Array<{ method: string; amount: number; count: number }>;
  topCourses: Array<{ courseTitle: string; revenue: number; enrollments: number }>;
}

/**
 * Student performance analytics
 */
export interface StudentPerformanceAnalytics {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageScore: number;
  attendanceRate: number;
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    averageScore: number;
    averageProgress: number;
  }>;
  performanceDistribution: Array<{ range: string; count: number }>;
}

/**
 * Course performance analytics
 */
export interface CoursePerformanceAnalytics {
  totalCourses: number;
  activeCourses: number;
  averageEnrollment: number;
  completionRate: number;
  topCourses: Array<{
    courseId: string;
    courseTitle: string;
    enrollments: number;
    completionRate: number;
    averageScore: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    enrollments: number;
    completionRate: number;
  }>;
}

/**
 * Advanced Analytics Service
 */
export class AdvancedAnalyticsService {
  /**
   * Get enrollment analytics for time range
   * OPTIMIZED: Parallel queries for faster performance
   */
  static getEnrollmentAnalytics = cache(async (
    timeRange?: TimeRange
  ): Promise<EnrollmentAnalytics> => {
    try {
      const conditions = [];
      
      if (timeRange) {
        conditions.push(
          gte(enrollments.enrolled, timeRange.start),
          lte(enrollments.enrolled, timeRange.end)
        );
      }

      // PARALLEL FETCH - All queries run simultaneously
      const [totalsResult, byMonth, byCategory, byLevel] = await Promise.all([
        // Total enrollments
        db
          .select({
            total: count(),
            active: sql<number>`count(*) filter (where ${enrollments.status} = 'active')`,
            completed: sql<number>`count(*) filter (where ${enrollments.status} = 'completed')`,
          })
          .from(enrollments)
          .where(conditions.length > 0 ? and(...conditions) : undefined),

        // Enrollments by month
        db
          .select({
            month: sql<string>`to_char(${enrollments.enrolled}, 'YYYY-MM')`,
            count: count(),
          })
          .from(enrollments)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .groupBy(sql`to_char(${enrollments.enrolled}, 'YYYY-MM')`)
          .orderBy(sql`to_char(${enrollments.enrolled}, 'YYYY-MM')`),

        // Enrollments by category
        db
          .select({
            category: courses.category,
            count: count(),
          })
          .from(enrollments)
          .innerJoin(courses, eq(enrollments.courseId, courses.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .groupBy(courses.category)
          .orderBy(desc(count())),

        // Enrollments by level
        db
          .select({
            level: courses.level,
            count: count(),
          })
          .from(enrollments)
          .innerJoin(courses, eq(enrollments.courseId, courses.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .groupBy(courses.level)
          .orderBy(desc(count())),
      ]);

      const [totals] = totalsResult;

      // Calculate growth rate (compare to previous period)
      const growthRate = 0; // TODO: Implement growth calculation

      return {
        total: Number(totals.total),
        active: Number(totals.active),
        completed: Number(totals.completed),
        byMonth: byMonth.map(m => ({
          month: m.month,
          count: Number(m.count),
        })),
        byCategory: byCategory.map(c => ({
          category: c.category || 'Uncategorized',
          count: Number(c.count),
        })),
        byLevel: byLevel.map(l => ({
          level: l.level,
          count: Number(l.count),
        })),
        growthRate,
      };
    } catch (error) {
      console.error('[Analytics] Enrollment analytics error:', error);
      throw error;
    }
  });

  /**
   * Get revenue analytics for time range
   */
  static getRevenueAnalytics = cache(async (
    timeRange?: TimeRange
  ): Promise<RevenueAnalytics> => {
    try {
      const conditions = [eq(payments.status, 'completed')];
      
      if (timeRange) {
        conditions.push(
          gte(payments.created, timeRange.start),
          lte(payments.created, timeRange.end)
        );
      }

      // PARALLEL FETCH - All queries run simultaneously for faster performance
      const [totalsResult, pendingResult, byMonth, byMethod, topCourses] = await Promise.all([
        // Total revenue and payment stats
        db
          .select({
            totalRevenue: sql<number>`coalesce(sum(${payments.amount}), 0)`,
            completedPayments: count(),
            averagePayment: sql<number>`coalesce(avg(${payments.amount}), 0)`,
          })
          .from(payments)
          .where(and(...conditions)),

        // Pending payments
        db
          .select({
            count: count(),
          })
          .from(payments)
          .where(eq(payments.status, 'pending')),

        // Revenue by month
        db
          .select({
            month: sql<string>`to_char(${payments.created}, 'YYYY-MM')`,
            amount: sql<number>`sum(${payments.amount})`,
          })
          .from(payments)
          .where(and(...conditions))
          .groupBy(sql`to_char(${payments.created}, 'YYYY-MM')`)
          .orderBy(sql`to_char(${payments.created}, 'YYYY-MM')`),

        // Revenue by payment method
        db
          .select({
            method: payments.method,
            amount: sql<number>`sum(${payments.amount})`,
            count: count(),
          })
          .from(payments)
          .where(and(...conditions))
          .groupBy(payments.method)
          .orderBy(desc(sql`sum(${payments.amount})`)),

        // Top revenue-generating courses
        db
          .select({
            courseTitle: courses.title,
            revenue: sql<number>`sum(${payments.amount})`,
            enrollments: count(),
          })
          .from(payments)
          .innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
          .innerJoin(courses, eq(enrollments.courseId, courses.id))
          .where(and(...conditions))
          .groupBy(courses.id, courses.title)
          .orderBy(desc(sql`sum(${payments.amount})`))
          .limit(10),
      ]);

      const [totals] = totalsResult;
      const [pending] = pendingResult;

      return {
        totalRevenue: Number(totals.totalRevenue),
        completedPayments: Number(totals.completedPayments),
        pendingPayments: Number(pending.count),
        averagePayment: Number(totals.averagePayment),
        byMonth: byMonth.map(m => ({
          month: m.month,
          amount: Number(m.amount),
        })),
        byMethod: byMethod.map(m => ({
          method: m.method || 'Unknown',
          amount: Number(m.amount),
          count: Number(m.count),
        })),
        topCourses: topCourses.map(c => ({
          courseTitle: c.courseTitle,
          revenue: Number(c.revenue),
          enrollments: Number(c.enrollments),
        })),
      };
    } catch (error) {
      console.error('[Analytics] Revenue analytics error:', error);
      throw error;
    }
  });

  /**
   * Get student performance analytics
   */
  static getStudentPerformanceAnalytics = cache(async (
    timeRange?: TimeRange
  ): Promise<StudentPerformanceAnalytics> => {
    try {
      // Total and active students
      const [studentCounts] = await db
        .select({
          total: count(),
          active: sql<number>`count(*) filter (where exists (
            select 1 from ${enrollments} 
            where ${enrollments.studentId} = ${students.userId} 
            and ${enrollments.status} = 'active'
          ))`,
        })
        .from(students);

      // Average progress across all enrollments
      const [progressStats] = await db
        .select({
          averageProgress: sql<number>`coalesce(avg(${enrollments.progress}), 0)`,
        })
        .from(enrollments)
        .where(eq(enrollments.status, 'active'));

      // Average score across all scores
      const [scoreStats] = await db
        .select({
          averageScore: sql<number>`
            coalesce(
              avg((${scores.score}::numeric / ${scores.maxScore}::numeric) * 100),
              0
            )
          `,
        })
        .from(scores);

      // Attendance rate
      const [attendanceStats] = await db
        .select({
          total: count(),
          present: sql<number>`count(*) filter (where ${attendances.status} = 'present')`,
        })
        .from(attendances);

      const attendanceRate = attendanceStats.total > 0
        ? (Number(attendanceStats.present) / Number(attendanceStats.total)) * 100
        : 0;

      // Top performers
      const topPerformers = await db
        .select({
          studentId: students.userId,
          studentName: users.name,
          averageScore: sql<number>`
            coalesce(
              avg((${scores.score}::numeric / ${scores.maxScore}::numeric) * 100),
              0
            )
          `,
          averageProgress: sql<number>`coalesce(avg(${enrollments.progress}), 0)`,
        })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .leftJoin(enrollments, eq(students.userId, enrollments.studentId))
        .leftJoin(scores, eq(enrollments.id, scores.enrollmentId))
        .groupBy(students.userId, users.name)
        .having(sql`count(${enrollments.id}) > 0`)
        .orderBy(desc(sql`avg((${scores.score}::numeric / ${scores.maxScore}::numeric) * 100)`))
        .limit(10);

      // Performance distribution
      const performanceDistribution = [
        { range: '90-100%', count: 0 },
        { range: '80-89%', count: 0 },
        { range: '70-79%', count: 0 },
        { range: '60-69%', count: 0 },
        { range: 'Below 60%', count: 0 },
      ];

      return {
        totalStudents: Number(studentCounts.total),
        activeStudents: Number(studentCounts.active),
        averageProgress: Number(progressStats.averageProgress),
        averageScore: Number(scoreStats.averageScore),
        attendanceRate,
        topPerformers: topPerformers.map(p => ({
          studentId: p.studentId,
          studentName: p.studentName,
          averageScore: Number(p.averageScore),
          averageProgress: Number(p.averageProgress),
        })),
        performanceDistribution,
      };
    } catch (error) {
      console.error('[Analytics] Student performance analytics error:', error);
      throw error;
    }
  });

  /**
   * Get course performance analytics
   */
  static getCoursePerformanceAnalytics = cache(async (
    timeRange?: TimeRange
  ): Promise<CoursePerformanceAnalytics> => {
    try {
      // Total and active courses
      const [courseCounts] = await db
        .select({
          total: count(),
          active: sql<number>`count(*) filter (where ${courses.isActive} = true)`,
        })
        .from(courses);

      // Average enrollment per course
      const [enrollmentStats] = await db
        .select({
          averageEnrollment: sql<number>`
            coalesce(
              avg((select count(*) from ${enrollments} where ${enrollments.courseId} = ${courses.id})),
              0
            )
          `,
        })
        .from(courses);

      // Overall completion rate
      const [completionStats] = await db
        .select({
          total: count(),
          completed: sql<number>`count(*) filter (where ${enrollments.status} = 'completed')`,
        })
        .from(enrollments);

      const completionRate = completionStats.total > 0
        ? (Number(completionStats.completed) / Number(completionStats.total)) * 100
        : 0;

      // Top performing courses
      const topCourses = await db
        .select({
          courseId: courses.id,
          courseTitle: courses.title,
          enrollments: count(),
          completionRate: sql<number>`
            (count(*) filter (where ${enrollments.status} = 'completed')::numeric / 
             count(*)::numeric * 100)
          `,
          averageScore: sql<number>`
            coalesce(
              avg((${scores.score}::numeric / ${scores.maxScore}::numeric) * 100),
              0
            )
          `,
        })
        .from(courses)
        .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
        .leftJoin(scores, eq(enrollments.id, scores.enrollmentId))
        .groupBy(courses.id, courses.title)
        .having(sql`count(${enrollments.id}) > 0`)
        .orderBy(desc(count()))
        .limit(10);

      // Category performance
      const categoryPerformance = await db
        .select({
          category: courses.category,
          enrollments: count(),
          completionRate: sql<number>`
            (count(*) filter (where ${enrollments.status} = 'completed')::numeric / 
             count(*)::numeric * 100)
          `,
        })
        .from(courses)
        .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
        .groupBy(courses.category)
        .having(sql`count(${enrollments.id}) > 0`)
        .orderBy(desc(count()));

      return {
        totalCourses: Number(courseCounts.total),
        activeCourses: Number(courseCounts.active),
        averageEnrollment: Number(enrollmentStats.averageEnrollment),
        completionRate,
        topCourses: topCourses.map(c => ({
          courseId: c.courseId,
          courseTitle: c.courseTitle,
          enrollments: Number(c.enrollments),
          completionRate: Number(c.completionRate),
          averageScore: Number(c.averageScore),
        })),
        categoryPerformance: categoryPerformance.map(c => ({
          category: c.category || 'Uncategorized',
          enrollments: Number(c.enrollments),
          completionRate: Number(c.completionRate),
        })),
      };
    } catch (error) {
      console.error('[Analytics] Course performance analytics error:', error);
      throw error;
    }
  });

  /**
   * Get teacher performance analytics
   */
  static getTeacherPerformanceAnalytics = cache(async () => {
    try {
      const teacherStats = await db
        .select({
          teacherId: teachers.userId,
          teacherName: users.name,
          totalCourses: sql<number>`count(distinct ${courses.id})`,
          totalEnrollments: sql<number>`count(distinct ${enrollments.id})`,
          averageScore: sql<number>`
            coalesce(
              avg((${scores.score}::numeric / ${scores.maxScore}::numeric) * 100),
              0
            )
          `,
          completionRate: sql<number>`
            (count(*) filter (where ${enrollments.status} = 'completed')::numeric / 
             nullif(count(${enrollments.id}), 0)::numeric * 100)
          `,
        })
        .from(teachers)
        .innerJoin(users, eq(teachers.userId, users.id))
        .leftJoin(courses, eq(teachers.userId, courses.teacherId))
        .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
        .leftJoin(scores, eq(enrollments.id, scores.enrollmentId))
        .groupBy(teachers.userId, users.name)
        .having(sql`count(distinct ${courses.id}) > 0`)
        .orderBy(desc(sql`count(distinct ${enrollments.id})`));

      return teacherStats.map(t => ({
        teacherId: t.teacherId,
        teacherName: t.teacherName,
        totalCourses: Number(t.totalCourses),
        totalEnrollments: Number(t.totalEnrollments),
        averageScore: Number(t.averageScore),
        completionRate: Number(t.completionRate) || 0,
      }));
    } catch (error) {
      console.error('[Analytics] Teacher performance analytics error:', error);
      throw error;
    }
  });

  /**
   * Get comprehensive platform analytics
   */
  static getPlatformAnalytics = cache(async (
    timeRange?: TimeRange
  ): Promise<{
    enrollments: EnrollmentAnalytics;
    revenue: RevenueAnalytics;
    students: StudentPerformanceAnalytics;
    courses: CoursePerformanceAnalytics;
  }> => {
    const [enrollments, revenue, students, courses] = await Promise.all([
      this.getEnrollmentAnalytics(timeRange),
      this.getRevenueAnalytics(timeRange),
      this.getStudentPerformanceAnalytics(timeRange),
      this.getCoursePerformanceAnalytics(timeRange),
    ]);

    return { enrollments, revenue, students, courses };
  });
}
