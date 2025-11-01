/**
 * Payment Service
 * 
 * Business logic layer for payment-related operations.
 */

import { cache } from 'react';
import { PaymentRepository } from '@/lib/repositories/payment.repository';
import { EnrollmentRepository } from '@/lib/repositories/enrollment.repository';

export class PaymentService {
  /**
   * Get payment details with enrollment information
   */
  static getPaymentDetails = cache(async (paymentId: string) => {
    const payment = await PaymentRepository.getPaymentById(paymentId);
    
    if (!payment) {
      return null;
    }

    // Calculate payment progress
    const totalAmount = parseFloat(payment.enrollmentTotalAmount || '0');
    const paidAmount = parseFloat(payment.enrollmentPaidAmount || '0');
    const paymentProgress = totalAmount > 0 
      ? Math.round((paidAmount / totalAmount) * 100) 
      : 0;

    return {
      ...payment,
      paymentProgress,
      remainingBalance: Math.max(0, totalAmount - paidAmount),
    };
  });

  /**
   * Get student's payment history
   */
  static getStudentPaymentHistory = cache(async (studentId: string) => {
    const payments = await PaymentRepository.getPaymentsByStudentId(studentId);

    // Calculate total paid and pending
    const totalPaid = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

    const totalPending = payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

    return {
      payments,
      totalPaid,
      totalPending,
      totalPayments: payments.length,
    };
  });

  /**
   * Get enrollment payment details
   */
  static getEnrollmentPaymentDetails = cache(async (enrollmentId: string) => {
    // Parallel fetch enrollment and payments
    const [enrollment, payments] = await Promise.all([
      EnrollmentRepository.getEnrollmentById(enrollmentId),
      PaymentRepository.getPaymentsByEnrollmentId(enrollmentId),
    ]);

    if (!enrollment) {
      return null;
    }

    // Calculate payment statistics
    const totalAmount = parseFloat(enrollment.totalAmount || '0');
    const paidAmount = parseFloat(enrollment.paidAmount || '0');
    const remainingBalance = Math.max(0, totalAmount - paidAmount);
    const paymentProgress = totalAmount > 0 
      ? Math.round((paidAmount / totalAmount) * 100) 
      : 0;

    const completedPayments = payments.filter((p) => p.status === 'completed');
    const pendingPayments = payments.filter((p) => p.status === 'pending');

    return {
      enrollment,
      payments,
      summary: {
        totalAmount,
        paidAmount,
        remainingBalance,
        paymentProgress,
        totalPayments: payments.length,
        completedPayments: completedPayments.length,
        pendingPayments: pendingPayments.length,
      },
    };
  });

  /**
   * Get all payments with statistics (admin view)
   */
  static getAllPaymentsWithStats = cache(async (status?: string) => {
    // Parallel fetch payments and stats
    const [payments, stats] = await Promise.all([
      PaymentRepository.getAllPayments(status),
      PaymentRepository.getPaymentStats(),
    ]);

    return {
      payments,
      stats,
    };
  });

  /**
   * Get payment dashboard statistics
   */
  static getPaymentDashboardStats = cache(async () => {
    const stats = await PaymentRepository.getPaymentStats();

    // Calculate additional metrics
    const completionRate = stats.totalPayments > 0 
      ? Math.round((stats.completedPayments / stats.totalPayments) * 100) 
      : 0;

    return {
      ...stats,
      completionRate,
    };
  });

  /**
   * Check if enrollment is fully paid
   */
  static isEnrollmentFullyPaid = cache(async (enrollmentId: string): Promise<boolean> => {
    const enrollment = await EnrollmentRepository.getEnrollmentById(enrollmentId);
    
    if (!enrollment) {
      return false;
    }

    const totalAmount = parseFloat(enrollment.totalAmount || '0');
    const paidAmount = parseFloat(enrollment.paidAmount || '0');

    return paidAmount >= totalAmount;
  });

  /**
   * Calculate payment progress percentage
   */
  static calculatePaymentProgress(totalAmount: string, paidAmount: string): number {
    const total = parseFloat(totalAmount || '0');
    const paid = parseFloat(paidAmount || '0');
    
    if (total === 0) return 0;
    
    return Math.round((paid / total) * 100);
  }

  /**
   * Calculate remaining balance
   */
  static calculateRemainingBalance(totalAmount: string, paidAmount: string): number {
    const total = parseFloat(totalAmount || '0');
    const paid = parseFloat(paidAmount || '0');
    
    return Math.max(0, total - paid);
  }
}
