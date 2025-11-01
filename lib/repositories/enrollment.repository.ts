/**
 * Enrollment Repository
 * 
 * Handles all database operations related to course enrollments.
 */

import { cache } from 'react';
import { db } from '@/lib/drizzle/db';
import { 
  enrollments, 
  courses, 
  students, 
  users,
  courseCategories,
  teachers
} from '@/lib/drizzle/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { BaseRepository } from './base.repository';

export class EnrollmentRepository extends BaseRepository {
  /**
   * Get enrollments by student ID
   */
  static getEnrollmentsByStudentId = cache(async (studentId: string) => {
    return await this.executeQuery(`getEnrollmentsByStudentId:${studentId}`, async () => {
      return await db
        .select({
          id: enrollments.id,
          courseId: enrollments.courseId,
          courseTitle: courses.title,
          courseDesc: courses.desc,
          courseCategory: courseCategories.name,
          courseLevel: courses.level,
          coursePrice: courses.price,
          courseDuration: courses.duration,
          courseDeliveryMode: courses.deliveryMode,
          courseLocation: courses.location,
          courseYoutubeUrl: courses.youtubeUrl,
          courseZoomUrl: courses.zoomUrl,
          teacherId: courses.teacherId,
          teacherName: users.name,
          teacherPhoto: teachers.photo,
          progress: enrollments.progress,
          status: enrollments.status,
          totalAmount: enrollments.totalAmount,
          paidAmount: enrollments.paidAmount,
          enrolled: enrollments.enrolled,
          completed: enrollments.completed,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
        .leftJoin(users, eq(teachers.userId, users.id))
        .leftJoin(courseCategories, eq(courses.category, courseCategories.slug))
        .where(eq(enrollments.studentId, studentId))
        .orderBy(desc(enrollments.enrolled));
    });
  });

  /**
   * Get enrollment by ID with full details
   */
  static getEnrollmentById = cache(async (enrollmentId: string) => {
    return await this.executeQuery(`getEnrollmentById:${enrollmentId}`, async () => {
      const [enrollment] = await db
        .select({
          id: enrollments.id,
          studentId: enrollments.studentId,
          courseId: enrollments.courseId,
          courseTitle: courses.title,
          courseDesc: courses.desc,
          courseCategory: courseCategories.name,
          courseLevel: courses.level,
          coursePrice: courses.price,
          courseDuration: courses.duration,
          courseDeliveryMode: courses.deliveryMode,
          courseLocation: courses.location,
          courseYoutubeUrl: courses.youtubeUrl,
          courseZoomUrl: courses.zoomUrl,
          teacherId: courses.teacherId,
          teacherName: users.name,
          teacherPhoto: teachers.photo,
          teacherBio: teachers.bio,
          teacherSpec: teachers.spec,
          progress: enrollments.progress,
          status: enrollments.status,
          totalAmount: enrollments.totalAmount,
          paidAmount: enrollments.paidAmount,
          enrolled: enrollments.enrolled,
          completed: enrollments.completed,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
        .leftJoin(users, eq(teachers.userId, users.id))
        .leftJoin(courseCategories, eq(courses.category, courseCategories.slug))
        .where(eq(enrollments.id, enrollmentId));

      return enrollment;
    });
  });

  /**
   * Get enrollments by course ID
   */
  static getEnrollmentsByCourseId = cache(async (courseId: string) => {
    return await this.executeQuery(`getEnrollmentsByCourseId:${courseId}`, async () => {
      return await db
        .select({
          id: enrollments.id,
          studentId: enrollments.studentId,
          studentName: users.name,
          studentEmail: users.email,
          studentPhoto: students.photo,
          progress: enrollments.progress,
          status: enrollments.status,
          totalAmount: enrollments.totalAmount,
          paidAmount: enrollments.paidAmount,
          enrolled: enrollments.enrolled,
          completed: enrollments.completed,
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.userId))
        .innerJoin(users, eq(students.userId, users.id))
        .where(eq(enrollments.courseId, courseId))
        .orderBy(desc(enrollments.enrolled));
    });
  });

  /**
   * Check if user is enrolled in a course
   */
  static isUserEnrolled = cache(async (studentId: string, courseId: string): Promise<boolean> => {
    return await this.executeQuery(`isUserEnrolled:${studentId}:${courseId}`, async () => {
      const [enrollment] = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, studentId),
            eq(enrollments.courseId, courseId)
          )
        )
        .limit(1);

      return !!enrollment;
    });
  });

  /**
   * Get enrollment count for a course
   */
  static getEnrollmentCount = cache(async (courseId: string) => {
    return await this.executeQuery(`getEnrollmentCount:${courseId}`, async () => {
      const [result] = await db
        .select({ count: count() })
        .from(enrollments)
        .where(eq(enrollments.courseId, courseId));

      return result?.count || 0;
    });
  });

  /**
   * Get active enrollments count for a student
   */
  static getActiveEnrollmentsCount = cache(async (studentId: string) => {
    return await this.executeQuery(`getActiveEnrollmentsCount:${studentId}`, async () => {
      const [result] = await db
        .select({ count: count() })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, studentId),
            eq(enrollments.status, 'active')
          )
        );

      return result?.count || 0;
    });
  });

  /**
   * Get completed enrollments count for a student
   */
  static getCompletedEnrollmentsCount = cache(async (studentId: string) => {
    return await this.executeQuery(`getCompletedEnrollmentsCount:${studentId}`, async () => {
      const [result] = await db
        .select({ count: count() })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, studentId),
            eq(enrollments.status, 'completed')
          )
        );

      return result?.count || 0;
    });
  });

  /**
   * Get average progress for a student
   */
  static getAverageProgress = cache(async (studentId: string) => {
    return await this.executeQuery(`getAverageProgress:${studentId}`, async () => {
      const [result] = await db
        .select({
          avgProgress: sql<number>`COALESCE(AVG(${enrollments.progress}), 0)::int`,
        })
        .from(enrollments)
        .where(eq(enrollments.studentId, studentId));

      return result?.avgProgress || 0;
    });
  });

  /**
   * Get all enrollments with student and course details for admin page
   */
  static getAllEnrollmentsWithDetails = cache(async () => {
    return await this.executeQuery('getAllEnrollmentsWithDetails', async () => {
      return await db
        .select({
          id: enrollments.id,
          studentName: users.name,
          studentSuid: students.suid,
          studentId: students.userId,
          courseTitle: courses.title,
          courseId: courses.id,
          status: enrollments.status,
          progress: enrollments.progress,
          enrolled: enrollments.enrolled,
          completed: enrollments.completed,
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.userId))
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .orderBy(desc(enrollments.enrolled));
    });
  });
}
