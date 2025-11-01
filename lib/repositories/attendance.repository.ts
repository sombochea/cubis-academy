/**
 * Attendance Repository
 * 
 * Handles all database operations related to student attendance.
 */

import { cache } from 'react';
import { db } from '@/lib/drizzle/db';
import { attendances, enrollments, courses, students, users } from '@/lib/drizzle/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { BaseRepository } from './base.repository';

export class AttendanceRepository extends BaseRepository {
  /**
   * Get attendance by ID
   */
  static getAttendanceById = cache(async (attendanceId: string) => {
    return await this.executeQuery(`getAttendanceById:${attendanceId}`, async () => {
      const [attendance] = await db
        .select({
          id: attendances.id,
          enrollmentId: attendances.enrollmentId,
          date: attendances.date,
          status: attendances.status,
          notes: attendances.notes,
          studentId: enrollments.studentId,
          studentName: users.name,
          courseId: enrollments.courseId,
          courseTitle: courses.title,
        })
        .from(attendances)
        .innerJoin(enrollments, eq(attendances.enrollmentId, enrollments.id))
        .innerJoin(students, eq(enrollments.studentId, students.userId))
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(attendances.id, attendanceId));

      return attendance;
    });
  });

  /**
   * Get attendance records by enrollment ID
   */
  static getAttendanceByEnrollmentId = cache(async (enrollmentId: string) => {
    return await this.executeQuery(`getAttendanceByEnrollmentId:${enrollmentId}`, async () => {
      return await db
        .select({
          id: attendances.id,
          date: attendances.date,
          status: attendances.status,
          notes: attendances.notes,
        })
        .from(attendances)
        .where(eq(attendances.enrollmentId, enrollmentId))
        .orderBy(desc(attendances.date));
    });
  });

  /**
   * Get attendance records by course ID (for teacher view)
   */
  static getAttendanceByCourseId = cache(async (courseId: string) => {
    return await this.executeQuery(`getAttendanceByCourseId:${courseId}`, async () => {
      return await db
        .select({
          id: attendances.id,
          enrollmentId: attendances.enrollmentId,
          date: attendances.date,
          status: attendances.status,
          notes: attendances.notes,
          studentId: enrollments.studentId,
          studentName: users.name,
          studentEmail: users.email,
        })
        .from(attendances)
        .innerJoin(enrollments, eq(attendances.enrollmentId, enrollments.id))
        .innerJoin(students, eq(enrollments.studentId, students.userId))
        .innerJoin(users, eq(students.userId, users.id))
        .where(eq(enrollments.courseId, courseId))
        .orderBy(desc(attendances.date));
    });
  });

  /**
   * Get attendance rate for an enrollment
   */
  static getAttendanceRateForEnrollment = cache(async (enrollmentId: string) => {
    return await this.executeQuery(`getAttendanceRateForEnrollment:${enrollmentId}`, async () => {
      const [result] = await db
        .select({
          totalSessions: sql<number>`count(*)::int`,
          presentCount: sql<number>`count(case when ${attendances.status} = 'present' then 1 end)::int`,
          absentCount: sql<number>`count(case when ${attendances.status} = 'absent' then 1 end)::int`,
          lateCount: sql<number>`count(case when ${attendances.status} = 'late' then 1 end)::int`,
          excusedCount: sql<number>`count(case when ${attendances.status} = 'excused' then 1 end)::int`,
        })
        .from(attendances)
        .where(eq(attendances.enrollmentId, enrollmentId));

      const totalSessions = result?.totalSessions || 0;
      const presentCount = result?.presentCount || 0;
      const attendanceRate = totalSessions > 0 
        ? Math.round((presentCount / totalSessions) * 100) 
        : 0;

      return {
        totalSessions,
        presentCount: result?.presentCount || 0,
        absentCount: result?.absentCount || 0,
        lateCount: result?.lateCount || 0,
        excusedCount: result?.excusedCount || 0,
        attendanceRate,
      };
    });
  });

  /**
   * Get attendance rate for a student across all enrollments
   */
  static getAttendanceRateForStudent = cache(async (studentId: string) => {
    return await this.executeQuery(`getAttendanceRateForStudent:${studentId}`, async () => {
      const [result] = await db
        .select({
          totalSessions: sql<number>`count(*)::int`,
          presentCount: sql<number>`count(case when ${attendances.status} = 'present' then 1 end)::int`,
        })
        .from(attendances)
        .innerJoin(enrollments, eq(attendances.enrollmentId, enrollments.id))
        .where(eq(enrollments.studentId, studentId));

      const totalSessions = result?.totalSessions || 0;
      const presentCount = result?.presentCount || 0;
      const attendanceRate = totalSessions > 0 
        ? Math.round((presentCount / totalSessions) * 100) 
        : 0;

      return attendanceRate;
    });
  });

  /**
   * Get class attendance average for a course
   */
  static getClassAttendanceForCourse = cache(async (courseId: string) => {
    return await this.executeQuery(`getClassAttendanceForCourse:${courseId}`, async () => {
      const [result] = await db
        .select({
          totalSessions: sql<number>`count(*)::int`,
          presentCount: sql<number>`count(case when ${attendances.status} = 'present' then 1 end)::int`,
          studentsWithRecords: sql<number>`count(distinct ${enrollments.studentId})::int`,
        })
        .from(attendances)
        .innerJoin(enrollments, eq(attendances.enrollmentId, enrollments.id))
        .where(eq(enrollments.courseId, courseId));

      const totalSessions = result?.totalSessions || 0;
      const presentCount = result?.presentCount || 0;
      const avgAttendanceRate = totalSessions > 0 
        ? Math.round((presentCount / totalSessions) * 100) 
        : 0;

      return {
        totalSessions,
        presentCount,
        avgAttendanceRate,
        studentsWithRecords: result?.studentsWithRecords || 0,
      };
    });
  });

  /**
   * Get recent attendance for a student (last N)
   */
  static getRecentAttendanceForStudent = cache(async (studentId: string, limit: number = 5) => {
    return await this.executeQuery(`getRecentAttendanceForStudent:${studentId}:${limit}`, async () => {
      return await db
        .select({
          id: attendances.id,
          date: attendances.date,
          status: attendances.status,
          notes: attendances.notes,
          courseTitle: courses.title,
        })
        .from(attendances)
        .innerJoin(enrollments, eq(attendances.enrollmentId, enrollments.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.studentId, studentId))
        .orderBy(desc(attendances.date))
        .limit(limit);
    });
  });

  /**
   * Get attendance count for an enrollment
   */
  static getAttendanceCountForEnrollment = cache(async (enrollmentId: string) => {
    return await this.executeQuery(`getAttendanceCountForEnrollment:${enrollmentId}`, async () => {
      const [result] = await db
        .select({ count: count() })
        .from(attendances)
        .where(eq(attendances.enrollmentId, enrollmentId));

      return result?.count || 0;
    });
  });

  /**
   * Check if attendance exists for date and enrollment
   */
  static attendanceExistsForDate = cache(async (enrollmentId: string, date: string): Promise<boolean> => {
    return await this.executeQuery(`attendanceExistsForDate:${enrollmentId}:${date}`, async () => {
      const [record] = await db
        .select({ id: attendances.id })
        .from(attendances)
        .where(
          and(
            eq(attendances.enrollmentId, enrollmentId),
            eq(attendances.date, date)
          )
        )
        .limit(1);

      return !!record;
    });
  });
}
