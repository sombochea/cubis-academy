/**
 * Score Repository
 * 
 * Handles all database operations related to student scores/grades.
 */

import { cache } from 'react';
import { db } from '@/lib/drizzle/db';
import { scores, enrollments, courses, students, users } from '@/lib/drizzle/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { BaseRepository } from './base.repository';

export class ScoreRepository extends BaseRepository {
  /**
   * Get score by ID
   */
  static getScoreById = cache(async (scoreId: string) => {
    return await this.executeQuery(`getScoreById:${scoreId}`, async () => {
      const [score] = await db
        .select({
          id: scores.id,
          enrollmentId: scores.enrollmentId,
          title: scores.title,
          score: scores.score,
          maxScore: scores.maxScore,
          remarks: scores.remarks,
          created: scores.created,
          studentId: enrollments.studentId,
          studentName: users.name,
          courseId: enrollments.courseId,
          courseTitle: courses.title,
        })
        .from(scores)
        .innerJoin(enrollments, eq(scores.enrollmentId, enrollments.id))
        .innerJoin(students, eq(enrollments.studentId, students.userId))
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(scores.id, scoreId));

      return score;
    });
  });

  /**
   * Get scores by enrollment ID
   */
  static getScoresByEnrollmentId = cache(async (enrollmentId: string) => {
    return await this.executeQuery(`getScoresByEnrollmentId:${enrollmentId}`, async () => {
      return await db
        .select({
          id: scores.id,
          title: scores.title,
          score: scores.score,
          maxScore: scores.maxScore,
          remarks: scores.remarks,
          created: scores.created,
        })
        .from(scores)
        .where(eq(scores.enrollmentId, enrollmentId))
        .orderBy(desc(scores.created));
    });
  });

  /**
   * Get scores by course ID (for teacher view)
   */
  static getScoresByCourseId = cache(async (courseId: string) => {
    return await this.executeQuery(`getScoresByCourseId:${courseId}`, async () => {
      return await db
        .select({
          id: scores.id,
          enrollmentId: scores.enrollmentId,
          title: scores.title,
          score: scores.score,
          maxScore: scores.maxScore,
          remarks: scores.remarks,
          created: scores.created,
          studentId: enrollments.studentId,
          studentName: users.name,
          studentEmail: users.email,
        })
        .from(scores)
        .innerJoin(enrollments, eq(scores.enrollmentId, enrollments.id))
        .innerJoin(students, eq(enrollments.studentId, students.userId))
        .innerJoin(users, eq(students.userId, users.id))
        .where(eq(enrollments.courseId, courseId))
        .orderBy(desc(scores.created));
    });
  });

  /**
   * Get average score for an enrollment
   */
  static getAverageScoreForEnrollment = cache(async (enrollmentId: string) => {
    return await this.executeQuery(`getAverageScoreForEnrollment:${enrollmentId}`, async () => {
      const [result] = await db
        .select({
          avgScore: sql<number>`COALESCE(AVG((${scores.score}::numeric / ${scores.maxScore}::numeric) * 100), 0)::int`,
          totalScores: sql<number>`count(*)::int`,
        })
        .from(scores)
        .where(eq(scores.enrollmentId, enrollmentId));

      return {
        avgScore: result?.avgScore || 0,
        totalScores: result?.totalScores || 0,
      };
    });
  });

  /**
   * Get average score for a student across all enrollments
   */
  static getAverageScoreForStudent = cache(async (studentId: string) => {
    return await this.executeQuery(`getAverageScoreForStudent:${studentId}`, async () => {
      const [result] = await db
        .select({
          avgScore: sql<number>`COALESCE(AVG((${scores.score}::numeric / ${scores.maxScore}::numeric) * 100), 0)::int`,
        })
        .from(scores)
        .innerJoin(enrollments, eq(scores.enrollmentId, enrollments.id))
        .where(eq(enrollments.studentId, studentId));

      return result?.avgScore || 0;
    });
  });

  /**
   * Get class average for a course
   */
  static getClassAverageForCourse = cache(async (courseId: string) => {
    return await this.executeQuery(`getClassAverageForCourse:${courseId}`, async () => {
      const [result] = await db
        .select({
          avgScore: sql<number>`COALESCE(AVG((${scores.score}::numeric / ${scores.maxScore}::numeric) * 100), 0)::int`,
          totalScores: sql<number>`count(*)::int`,
          studentsWithScores: sql<number>`count(distinct ${enrollments.studentId})::int`,
        })
        .from(scores)
        .innerJoin(enrollments, eq(scores.enrollmentId, enrollments.id))
        .where(eq(enrollments.courseId, courseId));

      return {
        avgScore: result?.avgScore || 0,
        totalScores: result?.totalScores || 0,
        studentsWithScores: result?.studentsWithScores || 0,
      };
    });
  });

  /**
   * Get recent scores for a student (last N)
   */
  static getRecentScoresForStudent = cache(async (studentId: string, limit: number = 5) => {
    return await this.executeQuery(`getRecentScoresForStudent:${studentId}:${limit}`, async () => {
      return await db
        .select({
          id: scores.id,
          title: scores.title,
          score: scores.score,
          maxScore: scores.maxScore,
          created: scores.created,
          courseTitle: courses.title,
        })
        .from(scores)
        .innerJoin(enrollments, eq(scores.enrollmentId, enrollments.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.studentId, studentId))
        .orderBy(desc(scores.created))
        .limit(limit);
    });
  });

  /**
   * Get score count for an enrollment
   */
  static getScoreCountForEnrollment = cache(async (enrollmentId: string) => {
    return await this.executeQuery(`getScoreCountForEnrollment:${enrollmentId}`, async () => {
      const [result] = await db
        .select({ count: count() })
        .from(scores)
        .where(eq(scores.enrollmentId, enrollmentId));

      return result?.count || 0;
    });
  });
}
