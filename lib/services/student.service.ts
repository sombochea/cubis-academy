/**
 * Student Service
 * 
 * Business logic layer for student-related operations.
 */

import { cache } from 'react';
import { StudentRepository } from '@/lib/repositories/student.repository';
import { EnrollmentRepository } from '@/lib/repositories/enrollment.repository';
import { ScoreRepository } from '@/lib/repositories/score.repository';
import { AttendanceRepository } from '@/lib/repositories/attendance.repository';
import { PaymentRepository } from '@/lib/repositories/payment.repository';

export class StudentService {
  /**
   * Get student dashboard data with all statistics
   * Optimized with parallel fetching
   */
  static getStudentDashboard = cache(async (studentId: string) => {
    // Parallel fetch all dashboard data
    const [
      student,
      stats,
      recentScores,
      recentAttendance,
      recentPayments,
    ] = await Promise.all([
      StudentRepository.getStudentByUserId(studentId),
      StudentRepository.getStudentStats(studentId),
      ScoreRepository.getRecentScoresForStudent(studentId, 5),
      AttendanceRepository.getRecentAttendanceForStudent(studentId, 5),
      PaymentRepository.getRecentPayments(5),
    ]);

    // Calculate additional metrics
    const avgScore = await ScoreRepository.getAverageScoreForStudent(studentId);
    const attendanceRate = await AttendanceRepository.getAttendanceRateForStudent(studentId);

    return {
      student,
      stats: {
        ...stats,
        avgScore,
        attendanceRate,
      },
      recentActivity: {
        scores: recentScores,
        attendance: recentAttendance,
        payments: recentPayments,
      },
    };
  });

  /**
   * Get student profile with complete information
   */
  static getStudentProfile = cache(async (studentId: string) => {
    // Parallel fetch profile and stats
    const [student, stats, enrollments] = await Promise.all([
      StudentRepository.getStudentByUserId(studentId),
      StudentRepository.getStudentStats(studentId),
      EnrollmentRepository.getEnrollmentsByStudentId(studentId),
    ]);

    return {
      student,
      stats,
      enrollments,
    };
  });

  /**
   * Get all students with statistics (for admin/teacher view)
   */
  static getAllStudentsWithStats = cache(async () => {
    return await StudentRepository.getAllStudentsWithStats();
  });

  /**
   * Get students for a specific teacher
   */
  static getStudentsForTeacher = cache(async (teacherId: string) => {
    const students = await StudentRepository.getStudentsByTeacherId(teacherId);

    // Group by student to avoid duplicates
    const uniqueStudents = new Map();
    
    students.forEach((student) => {
      if (!uniqueStudents.has(student.userId)) {
        uniqueStudents.set(student.userId, {
          userId: student.userId,
          photo: student.photo,
          userName: student.userName,
          userEmail: student.userEmail,
          courses: [],
        });
      }
      
      uniqueStudents.get(student.userId).courses.push({
        courseId: student.courseId,
        courseTitle: student.courseTitle,
        enrollmentId: student.enrollmentId,
        progress: student.progress,
        status: student.status,
        enrolled: student.enrolled,
      });
    });

    return Array.from(uniqueStudents.values());
  });

  /**
   * Get student performance summary
   */
  static getStudentPerformance = cache(async (studentId: string) => {
    // Parallel fetch all performance metrics
    const [
      avgScore,
      attendanceRate,
      enrollments,
    ] = await Promise.all([
      ScoreRepository.getAverageScoreForStudent(studentId),
      AttendanceRepository.getAttendanceRateForStudent(studentId),
      EnrollmentRepository.getEnrollmentsByStudentId(studentId),
    ]);

    // Calculate completion rate
    const completedCourses = enrollments.filter((e) => e.status === 'completed').length;
    const completionRate = enrollments.length > 0 
      ? Math.round((completedCourses / enrollments.length) * 100) 
      : 0;

    return {
      avgScore,
      attendanceRate,
      completionRate,
      totalCourses: enrollments.length,
      completedCourses,
      activeCourses: enrollments.filter((e) => e.status === 'active').length,
    };
  });
}
