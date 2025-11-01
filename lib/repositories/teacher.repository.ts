/**
 * Teacher Repository
 * 
 * Handles all database operations related to teachers.
 */

import { cache } from 'react';
import { db } from '@/lib/drizzle/db';
import { teachers, users, courses, enrollments } from '@/lib/drizzle/schema';
import { eq, desc, count, sql } from 'drizzle-orm';
import { BaseRepository } from './base.repository';

export class TeacherRepository extends BaseRepository {
  /**
   * Get teacher by user ID
   */
  static getTeacherByUserId = cache(async (userId: string) => {
    return await this.executeQuery(`getTeacherByUserId:${userId}`, async () => {
      const [teacher] = await db
        .select({
          userId: teachers.userId,
          photo: teachers.photo,
          bio: teachers.bio,
          spec: teachers.spec,
          schedule: teachers.schedule,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
          userCreated: users.created,
        })
        .from(teachers)
        .innerJoin(users, eq(teachers.userId, users.id))
        .where(eq(teachers.userId, userId));

      return teacher;
    });
  });

  /**
   * Get all teachers with course counts
   */
  static getAllTeachersWithStats = cache(async () => {
    return await this.executeQuery('getAllTeachersWithStats', async () => {
      return await db
        .select({
          userId: teachers.userId,
          photo: teachers.photo,
          bio: teachers.bio,
          spec: teachers.spec,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
          courseCount: sql<number>`count(distinct ${courses.id})::int`,
          activeCourses: sql<number>`count(distinct case when ${courses.isActive} = true then ${courses.id} end)::int`,
          totalStudents: sql<number>`count(distinct ${enrollments.studentId})::int`,
        })
        .from(teachers)
        .innerJoin(users, eq(teachers.userId, users.id))
        .leftJoin(courses, eq(teachers.userId, courses.teacherId))
        .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
        .groupBy(teachers.userId, users.id)
        .orderBy(desc(users.created));
    });
  });

  /**
   * Get teacher by ID with full details
   */
  static getTeacherById = cache(async (userId: string) => {
    return await this.executeQuery(`getTeacherById:${userId}`, async () => {
      const [teacher] = await db
        .select({
          userId: teachers.userId,
          photo: teachers.photo,
          bio: teachers.bio,
          spec: teachers.spec,
          schedule: teachers.schedule,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
          userCreated: users.created,
        })
        .from(teachers)
        .innerJoin(users, eq(teachers.userId, users.id))
        .where(eq(teachers.userId, userId));

      return teacher;
    });
  });

  /**
   * Get teacher statistics
   */
  static getTeacherStats = cache(async (userId: string) => {
    return await this.executeQuery(`getTeacherStats:${userId}`, async () => {
      const [stats] = await db
        .select({
          totalCourses: sql<number>`count(distinct ${courses.id})::int`,
          activeCourses: sql<number>`count(distinct case when ${courses.isActive} = true then ${courses.id} end)::int`,
          totalEnrollments: sql<number>`count(distinct ${enrollments.id})::int`,
          activeEnrollments: sql<number>`count(distinct case when ${enrollments.status} = 'active' then ${enrollments.id} end)::int`,
          totalStudents: sql<number>`count(distinct ${enrollments.studentId})::int`,
        })
        .from(teachers)
        .leftJoin(courses, eq(teachers.userId, courses.teacherId))
        .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
        .where(eq(teachers.userId, userId));

      return stats || {
        totalCourses: 0,
        activeCourses: 0,
        totalEnrollments: 0,
        activeEnrollments: 0,
        totalStudents: 0,
      };
    });
  });

  /**
   * Get total teachers count
   */
  static getTotalTeachersCount = cache(async () => {
    return await this.executeQuery('getTotalTeachersCount', async () => {
      const [result] = await db
        .select({ count: count() })
        .from(teachers);

      return result?.count || 0;
    });
  });

  /**
   * Search teachers by specialization
   */
  static searchBySpecialization = cache(async (spec: string) => {
    return await this.executeQuery(`searchBySpecialization:${spec}`, async () => {
      return await db
        .select({
          userId: teachers.userId,
          photo: teachers.photo,
          bio: teachers.bio,
          spec: teachers.spec,
          userName: users.name,
          userEmail: users.email,
        })
        .from(teachers)
        .innerJoin(users, eq(teachers.userId, users.id))
        .where(sql`${teachers.spec} ILIKE ${`%${spec}%`}`)
        .orderBy(desc(users.created));
    });
  });
}
