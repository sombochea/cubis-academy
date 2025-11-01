/**
 * Student Repository
 * 
 * Handles all database operations related to students.
 */

import { cache } from 'react';
import { db } from '@/lib/drizzle/db';
import { students, users, enrollments, courses } from '@/lib/drizzle/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { BaseRepository } from './base.repository';

export class StudentRepository extends BaseRepository {
  /**
   * Get student by user ID
   */
  static getStudentByUserId = cache(async (userId: string) => {
    return await this.executeQuery(`getStudentByUserId:${userId}`, async () => {
      const [student] = await db
        .select({
          userId: students.userId,
          photo: students.photo,
          dob: students.dob,
          gender: students.gender,
          address: students.address,
          enrolled: students.enrolled,
          onboardingCompleted: students.onboardingCompleted,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
          userCreated: users.created,
        })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(eq(students.userId, userId));

      return student;
    });
  });

  /**
   * Get all students with enrollment counts
   */
  static getAllStudentsWithStats = cache(async () => {
    return await this.executeQuery('getAllStudentsWithStats', async () => {
      return await db
        .select({
          userId: students.userId,
          photo: students.photo,
          gender: students.gender,
          enrolled: students.enrolled,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
          enrollmentCount: sql<number>`count(distinct ${enrollments.id})::int`,
          activeEnrollments: sql<number>`count(distinct case when ${enrollments.status} = 'active' then ${enrollments.id} end)::int`,
          completedEnrollments: sql<number>`count(distinct case when ${enrollments.status} = 'completed' then ${enrollments.id} end)::int`,
          avgProgress: sql<number>`COALESCE(AVG(${enrollments.progress}), 0)::int`,
        })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .leftJoin(enrollments, eq(students.userId, enrollments.studentId))
        .groupBy(students.userId, users.id)
        .orderBy(desc(students.enrolled));
    });
  });

  /**
   * Get students enrolled in a specific course
   */
  static getStudentsByCourseId = cache(async (courseId: string) => {
    return await this.executeQuery(`getStudentsByCourseId:${courseId}`, async () => {
      return await db
        .select({
          userId: students.userId,
          photo: students.photo,
          userName: users.name,
          userEmail: users.email,
          enrollmentId: enrollments.id,
          progress: enrollments.progress,
          status: enrollments.status,
          enrolled: enrollments.enrolled,
        })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(enrollments, eq(students.userId, enrollments.studentId))
        .where(eq(enrollments.courseId, courseId))
        .orderBy(desc(enrollments.enrolled));
    });
  });

  /**
   * Get students enrolled in teacher's courses
   */
  static getStudentsByTeacherId = cache(async (teacherId: string) => {
    return await this.executeQuery(`getStudentsByTeacherId:${teacherId}`, async () => {
      return await db
        .select({
          userId: students.userId,
          photo: students.photo,
          userName: users.name,
          userEmail: users.email,
          courseId: courses.id,
          courseTitle: courses.title,
          enrollmentId: enrollments.id,
          progress: enrollments.progress,
          status: enrollments.status,
          enrolled: enrollments.enrolled,
        })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(enrollments, eq(students.userId, enrollments.studentId))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(courses.teacherId, teacherId))
        .orderBy(desc(enrollments.enrolled));
    });
  });

  /**
   * Get student statistics
   */
  static getStudentStats = cache(async (userId: string) => {
    return await this.executeQuery(`getStudentStats:${userId}`, async () => {
      const [stats] = await db
        .select({
          totalEnrollments: sql<number>`count(distinct ${enrollments.id})::int`,
          activeEnrollments: sql<number>`count(distinct case when ${enrollments.status} = 'active' then ${enrollments.id} end)::int`,
          completedEnrollments: sql<number>`count(distinct case when ${enrollments.status} = 'completed' then ${enrollments.id} end)::int`,
          avgProgress: sql<number>`COALESCE(AVG(${enrollments.progress}), 0)::int`,
        })
        .from(enrollments)
        .where(eq(enrollments.studentId, userId));

      return stats || {
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        avgProgress: 0,
      };
    });
  });

  /**
   * Get total students count
   */
  static getTotalStudentsCount = cache(async () => {
    return await this.executeQuery('getTotalStudentsCount', async () => {
      const [result] = await db
        .select({ count: count() })
        .from(students);

      return result?.count || 0;
    });
  });

  /**
   * Check if student has completed onboarding
   */
  static hasCompletedOnboarding = cache(async (userId: string): Promise<boolean> => {
    return await this.executeQuery(`hasCompletedOnboarding:${userId}`, async () => {
      const [student] = await db
        .select({ onboardingCompleted: students.onboardingCompleted })
        .from(students)
        .where(eq(students.userId, userId))
        .limit(1);

      return student?.onboardingCompleted || false;
    });
  });
}
