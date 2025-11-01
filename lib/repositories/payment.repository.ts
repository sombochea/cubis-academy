/**
 * Payment Repository
 * 
 * Handles all database operations related to payments.
 */

import { cache } from 'react';
import { db } from '@/lib/drizzle/db';
import { 
  payments, 
  enrollments, 
  courses, 
  students, 
  users 
} from '@/lib/drizzle/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { BaseRepository } from './base.repository';

export class PaymentRepository extends BaseRepository {
  /**
   * Get payment by ID with full details
   */
  static getPaymentById = cache(async (paymentId: string) => {
    return await this.executeQuery(`getPaymentById:${paymentId}`, async () => {
      const [payment] = await db
        .select({
          id: payments.id,
          studentId: payments.studentId,
          enrollmentId: payments.enrollmentId,
          amount: payments.amount,
          method: payments.method,
          status: payments.status,
          txnId: payments.txnId,
          proofUrl: payments.proofUrl,
          notes: payments.notes,
          created: payments.created,
          studentName: users.name,
          studentEmail: users.email,
          studentPhoto: students.photo,
          courseId: courses.id,
          courseTitle: courses.title,
          enrollmentTotalAmount: enrollments.totalAmount,
          enrollmentPaidAmount: enrollments.paidAmount,
        })
        .from(payments)
        .innerJoin(students, eq(payments.studentId, students.userId))
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(payments.id, paymentId));

      return payment;
    });
  });

  /**
   * Get payments by student ID
   */
  static getPaymentsByStudentId = cache(async (studentId: string) => {
    return await this.executeQuery(`getPaymentsByStudentId:${studentId}`, async () => {
      return await db
        .select({
          id: payments.id,
          enrollmentId: payments.enrollmentId,
          amount: payments.amount,
          method: payments.method,
          status: payments.status,
          txnId: payments.txnId,
          proofUrl: payments.proofUrl,
          created: payments.created,
          courseId: courses.id,
          courseTitle: courses.title,
        })
        .from(payments)
        .innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(payments.studentId, studentId))
        .orderBy(desc(payments.created));
    });
  });

  /**
   * Get payments by enrollment ID
   */
  static getPaymentsByEnrollmentId = cache(async (enrollmentId: string) => {
    return await this.executeQuery(`getPaymentsByEnrollmentId:${enrollmentId}`, async () => {
      return await db
        .select({
          id: payments.id,
          amount: payments.amount,
          method: payments.method,
          status: payments.status,
          txnId: payments.txnId,
          proofUrl: payments.proofUrl,
          notes: payments.notes,
          created: payments.created,
        })
        .from(payments)
        .where(eq(payments.enrollmentId, enrollmentId))
        .orderBy(desc(payments.created));
    });
  });

  /**
   * Get all payments with filters
   */
  static getAllPayments = cache(async (status?: string) => {
    return await this.executeQuery('getAllPayments', async () => {
      const query = db
        .select({
          id: payments.id,
          studentId: payments.studentId,
          studentSuid: students.suid,
          enrollmentId: payments.enrollmentId,
          amount: payments.amount,
          method: payments.method,
          status: payments.status,
          txnId: payments.txnId,
          created: payments.created,
          studentName: users.name,
          studentEmail: users.email,
          courseTitle: courses.title,
          courseId: courses.id,
        })
        .from(payments)
        .innerJoin(students, eq(payments.studentId, students.userId))
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .orderBy(desc(payments.created));

      if (status) {
        return await query.where(eq(payments.status, status as any));
      }

      return await query;
    });
  });

  /**
   * Get pending payments count
   */
  static getPendingPaymentsCount = cache(async () => {
    return await this.executeQuery('getPendingPaymentsCount', async () => {
      const [result] = await db
        .select({ count: count() })
        .from(payments)
        .where(eq(payments.status, 'pending'));

      return result?.count || 0;
    });
  });

  /**
   * Get payment statistics
   */
  static getPaymentStats = cache(async () => {
    return await this.executeQuery('getPaymentStats', async () => {
      const [stats] = await db
        .select({
          totalPayments: sql<number>`count(*)::int`,
          pendingPayments: sql<number>`count(case when ${payments.status} = 'pending' then 1 end)::int`,
          completedPayments: sql<number>`count(case when ${payments.status} = 'completed' then 1 end)::int`,
          totalAmount: sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'completed' THEN ${payments.amount}::numeric ELSE 0 END), 0)::numeric`,
          pendingAmount: sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'pending' THEN ${payments.amount}::numeric ELSE 0 END), 0)::numeric`,
        })
        .from(payments);

      return stats || {
        totalPayments: 0,
        pendingPayments: 0,
        completedPayments: 0,
        totalAmount: 0,
        pendingAmount: 0,
      };
    });
  });

  /**
   * Get recent payments (last N)
   */
  static getRecentPayments = cache(async (limit: number = 5) => {
    return await this.executeQuery(`getRecentPayments:${limit}`, async () => {
      return await db
        .select({
          id: payments.id,
          amount: payments.amount,
          method: payments.method,
          status: payments.status,
          created: payments.created,
          studentName: users.name,
          courseTitle: courses.title,
        })
        .from(payments)
        .innerJoin(students, eq(payments.studentId, students.userId))
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .orderBy(desc(payments.created))
        .limit(limit);
    });
  });

  /**
   * Get total paid amount for an enrollment
   */
  static getTotalPaidForEnrollment = cache(async (enrollmentId: string) => {
    return await this.executeQuery(`getTotalPaidForEnrollment:${enrollmentId}`, async () => {
      const [result] = await db
        .select({
          totalPaid: sql<number>`COALESCE(SUM(${payments.amount}::numeric), 0)::numeric`,
        })
        .from(payments)
        .where(
          and(
            eq(payments.enrollmentId, enrollmentId),
            eq(payments.status, 'completed')
          )
        );

      return parseFloat(result?.totalPaid?.toString() || '0');
    });
  });
}
