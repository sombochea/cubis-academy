/**
 * Teacher Service
 * 
 * Business logic layer for teacher-related operations.
 */

import { cache } from 'react';
import { TeacherRepository } from '@/lib/repositories/teacher.repository';
import { CourseRepository } from '@/lib/repositories/course.repository';
import { StudentRepository } from '@/lib/repositories/student.repository';

export class TeacherService {
  /**
   * Get teacher dashboard data with all statistics
   * Optimized with parallel fetching
   */
  static getTeacherDashboard = cache(async (teacherId: string) => {
    // Parallel fetch all dashboard data
    const [teacher, stats, courses, students] = await Promise.all([
      TeacherRepository.getTeacherByUserId(teacherId),
      TeacherRepository.getTeacherStats(teacherId),
      CourseRepository.getCoursesByTeacherId(teacherId),
      StudentRepository.getStudentsByTeacherId(teacherId),
    ]);

    // Get unique students count
    const uniqueStudents = new Set(students.map((s) => s.userId));

    return {
      teacher,
      stats: {
        ...stats,
        uniqueStudents: uniqueStudents.size,
      },
      courses,
      recentStudents: students.slice(0, 5),
    };
  });

  /**
   * Get teacher profile with complete information
   */
  static getTeacherProfile = cache(async (teacherId: string) => {
    // Parallel fetch profile and stats
    const [teacher, stats, courses] = await Promise.all([
      TeacherRepository.getTeacherByUserId(teacherId),
      TeacherRepository.getTeacherStats(teacherId),
      CourseRepository.getCoursesByTeacherId(teacherId),
    ]);

    return {
      teacher,
      stats,
      courses,
    };
  });

  /**
   * Get all teachers with statistics (for admin view)
   */
  static getAllTeachersWithStats = cache(async () => {
    return await TeacherRepository.getAllTeachersWithStats();
  });

  /**
   * Get teacher details for public view (student portal)
   */
  static getTeacherPublicProfile = cache(async (teacherId: string) => {
    // Parallel fetch teacher and active courses
    const [teacher, courses] = await Promise.all([
      TeacherRepository.getTeacherById(teacherId),
      CourseRepository.getCoursesByTeacherId(teacherId),
    ]);

    // Filter only active courses for public view
    const activeCourses = courses.filter((c) => c.isActive);

    return {
      teacher,
      courses: activeCourses,
      courseCount: activeCourses.length,
    };
  });

  /**
   * Search teachers by specialization
   */
  static searchTeachersBySpecialization = cache(async (spec: string) => {
    return await TeacherRepository.searchBySpecialization(spec);
  });
}
