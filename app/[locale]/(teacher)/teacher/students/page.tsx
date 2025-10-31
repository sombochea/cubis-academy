import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, enrollments, users, students } from '@/lib/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { StudentsDataTable } from '@/components/teacher/StudentsDataTable';
import { Trans } from '@lingui/react/macro';
import {
  Users,
  TrendingUp,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function TeacherStudentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  const session = await auth();

  if (!session?.user || session.user.role !== 'teacher') {
    redirect(`/${locale}/login`);
  }

  // Get all students enrolled in teacher's courses with their stats
  const teacherStudents = await db
    .select({
      studentId: students.userId,
      studentName: users.name,
      studentEmail: users.email,
      studentPhoto: students.photo,
      courseId: courses.id,
      courseTitle: courses.title,
      enrollmentId: enrollments.id,
      progress: enrollments.progress,
      status: enrollments.status,
      enrolled: enrollments.enrolled,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(students, eq(enrollments.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(courses.teacherId, session.user.id))
    .orderBy(users.name);

  // Group students by student ID to avoid duplicates
  const uniqueStudents = new Map();
  const studentCourses = new Map();

  teacherStudents.forEach((enrollment) => {
    if (!uniqueStudents.has(enrollment.studentId)) {
      uniqueStudents.set(enrollment.studentId, {
        id: enrollment.studentId,
        name: enrollment.studentName,
        email: enrollment.studentEmail,
        photo: enrollment.studentPhoto,
        totalCourses: 0,
        avgProgress: 0,
        lastEnrolled: enrollment.enrolled,
      });
      studentCourses.set(enrollment.studentId, []);
    }

    studentCourses.get(enrollment.studentId).push({
      courseId: enrollment.courseId,
      courseTitle: enrollment.courseTitle,
      progress: enrollment.progress,
      status: enrollment.status,
      enrolled: enrollment.enrolled,
    });
  });

  // Calculate stats for each student
  uniqueStudents.forEach((student, studentId) => {
    const courses = studentCourses.get(studentId);
    student.totalCourses = courses.length;
    student.avgProgress = Math.round(
      courses.reduce((sum: number, course: any) => sum + course.progress, 0) / courses.length
    );
    student.lastEnrolled = Math.max(
      ...courses.map((c: any) => new Date(c.enrolled).getTime())
    );
    student.courses = courses;
  });

  const studentsArray = Array.from(uniqueStudents.values());

  // Calculate overall stats
  const totalStudents = studentsArray.length;
  const totalEnrollments = teacherStudents.length;
  const avgProgress = studentsArray.length > 0
    ? Math.round(
        studentsArray.reduce((sum, student) => sum + student.avgProgress, 0) / studentsArray.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>My Students</Trans>
          </h1>
          <p className="text-[#363942]/70">
            <Trans>View and manage students enrolled in your courses</Trans>
          </p>
        </div>

        {/* Stats - At least 2 columns on small devices */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {totalStudents}
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Total Students</Trans>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {totalEnrollments}
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Total Enrollments</Trans>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {avgProgress}%
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Avg Progress</Trans>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {studentsArray.filter(s => s.avgProgress >= 75).length}
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>High Performers</Trans>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <StudentsDataTable students={studentsArray} locale={locale} />
      </div>
    </div>
  );
}
