/**
 * Course Repository
 * 
 * Handles all database operations related to courses.
 * Uses React cache() for automatic request deduplication.
 */

import { cache } from 'react';
import { db } from '@/lib/drizzle/db';
import { 
  courses, 
  teachers, 
  users, 
  courseCategories,
  enrollments,
  classSchedules
} from '@/lib/drizzle/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { BaseRepository } from './base.repository';

export class CourseRepository extends BaseRepository {
  /**
   * Get all active courses with teacher and category info
   */
  static getActiveCourses = cache(async () => {
    return await this.executeQuery('getActiveCourses', async () => {
      return await db
        .select({
          id: courses.id,
          title: courses.title,
          desc: courses.desc,
          category: courseCategories.name,
          categorySlug: courseCategories.slug,
          categoryColor: courseCategories.color,
          level: courses.level,
          price: courses.price,
          duration: courses.duration,
          deliveryMode: courses.deliveryMode,
          teacherId: courses.teacherId,
          teacherName: users.name,
          teacherPhoto: teachers.photo,
          teacherSpec: teachers.spec,
          created: courses.created,
        })
        .from(courses)
        .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
        .leftJoin(users, eq(teachers.userId, users.id))
        .leftJoin(courseCategories, eq(courses.category, courseCategories.slug))
        .where(eq(courses.isActive, true))
        .orderBy(desc(courses.created));
    });
  });

  /**
   * Get course by ID with full details
   */
  static getCourseById = cache(async (courseId: string) => {
    return await this.executeQuery(`getCourseById:${courseId}`, async () => {
      const [course] = await db
        .select({
          id: courses.id,
          title: courses.title,
          desc: courses.desc,
          category: courseCategories.name,
          categorySlug: courseCategories.slug,
          categoryColor: courseCategories.color,
          level: courses.level,
          price: courses.price,
          duration: courses.duration,
          deliveryMode: courses.deliveryMode,
          location: courses.location,
          youtubeUrl: courses.youtubeUrl,
          zoomUrl: courses.zoomUrl,
          isActive: courses.isActive,
          teacherId: courses.teacherId,
          teacherName: users.name,
          teacherEmail: users.email,
          teacherPhoto: teachers.photo,
          teacherBio: teachers.bio,
          teacherSpec: teachers.spec,
          created: courses.created,
          updated: courses.updated,
        })
        .from(courses)
        .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
        .leftJoin(users, eq(teachers.userId, users.id))
        .leftJoin(courseCategories, eq(courses.category, courseCategories.slug))
        .where(eq(courses.id, courseId));

      return course;
    });
  });

  /**
   * Get courses by teacher ID
   */
  static getCoursesByTeacherId = cache(async (teacherId: string) => {
    return await this.executeQuery(`getCoursesByTeacherId:${teacherId}`, async () => {
      return await db
        .select({
          id: courses.id,
          title: courses.title,
          desc: courses.desc,
          category: courses.category,
          category_id: courseCategories.id,
          category_name: courseCategories.name,
          level: courses.level,
          price: courses.price,
          duration: courses.duration,
          deliveryMode: courses.deliveryMode,
          isActive: courses.isActive,
          created: courses.created,
          updated: courses.updated,
        })
        .from(courses)
        .leftJoin(courseCategories, eq(courses.category, courseCategories.slug))
        .where(eq(courses.teacherId, teacherId))
        .orderBy(desc(courses.created));
    });
  });

  /**
   * Get course statistics (enrollments, revenue)
   */
  static getCourseStats = cache(async (courseId: string) => {
    return await this.executeQuery(`getCourseStats:${courseId}`, async () => {
      const [stats] = await db
        .select({
          totalEnrollments: sql<number>`count(distinct ${enrollments.id})::int`,
          activeEnrollments: sql<number>`count(distinct case when ${enrollments.status} = 'active' then ${enrollments.id} end)::int`,
          completedEnrollments: sql<number>`count(distinct case when ${enrollments.status} = 'completed' then ${enrollments.id} end)::int`,
        })
        .from(courses)
        .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
        .where(eq(courses.id, courseId));

      return stats || {
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
      };
    });
  });

  /**
   * Get course schedules
   */
  static getCourseSchedules = cache(async (courseId: string) => {
    return await this.executeQuery(`getCourseSchedules:${courseId}`, async () => {
      return await db
        .select({
          id: classSchedules.id,
          dayOfWeek: classSchedules.dayOfWeek,
          startTime: classSchedules.startTime,
          endTime: classSchedules.endTime,
          location: classSchedules.location,
          notes: classSchedules.notes,
          isActive: classSchedules.isActive,
        })
        .from(classSchedules)
        .where(
          and(
            eq(classSchedules.courseId, courseId),
            eq(classSchedules.isActive, true)
          )
        )
        .orderBy(classSchedules.dayOfWeek);
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
   * Get active enrollment count for a course
   */
  static getActiveEnrollmentCount = cache(async (courseId: string) => {
    return await this.executeQuery(`getActiveEnrollmentCount:${courseId}`, async () => {
      const [result] = await db
        .select({ count: count() })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.courseId, courseId),
            eq(enrollments.status, 'active')
          )
        );

      return result?.count || 0;
    });
  });

  /**
   * Check if course exists and is active
   */
  static isCourseActive = cache(async (courseId: string): Promise<boolean> => {
    return await this.executeQuery(`isCourseActive:${courseId}`, async () => {
      const [course] = await db
        .select({ id: courses.id })
        .from(courses)
        .where(
          and(
            eq(courses.id, courseId),
            eq(courses.isActive, true)
          )
        )
        .limit(1);

      return !!course;
    });
  });
}
