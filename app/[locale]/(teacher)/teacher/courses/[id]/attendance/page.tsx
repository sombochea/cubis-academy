import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, enrollments, users, students, attendances } from '@/lib/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { AttendanceManager } from '@/components/teacher/AttendanceManager';
import { Trans } from '@lingui/react/macro';
import { ArrowLeft, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function CourseAttendancePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  const session = await auth();

  if (!session?.user || session.user.role !== 'teacher') {
    redirect(`/${locale}/login`);
  }

  // Verify course ownership
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, id), eq(courses.teacherId, session.user.id)));

  if (!course) {
    notFound();
  }

  // Get enrolled students
  const enrolledStudents = await db
    .select({
      enrollmentId: enrollments.id,
      studentId: students.userId,
      studentName: users.name,
      studentEmail: users.email,
      status: enrollments.status,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(enrollments.courseId, id))
    .orderBy(users.name);

  // Get all attendance records for this course
  const courseAttendance = await db
    .select({
      id: attendances.id,
      enrollmentId: attendances.enrollmentId,
      date: attendances.date,
      status: attendances.status,
      notes: attendances.notes,
    })
    .from(attendances)
    .innerJoin(enrollments, eq(attendances.enrollmentId, enrollments.id))
    .where(eq(enrollments.courseId, id))
    .orderBy(desc(attendances.date));

  // Group attendance by enrollment
  const attendanceByEnrollment = new Map();
  courseAttendance.forEach((record) => {
    if (!attendanceByEnrollment.has(record.enrollmentId)) {
      attendanceByEnrollment.set(record.enrollmentId, []);
    }
    attendanceByEnrollment.get(record.enrollmentId).push(record);
  });

  // Calculate attendance stats
  const studentsWithAttendance = enrolledStudents.map((student) => {
    const records = attendanceByEnrollment.get(student.enrollmentId) || [];
    const presentCount = records.filter((r) => r.status === 'present').length;
    const totalRecords = records.length;
    const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : null;

    return {
      ...student,
      attendanceRecords: records,
      presentCount,
      totalRecords,
      attendanceRate,
    };
  });

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={`/${locale}/teacher/courses/${id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <Trans>Back to Course</Trans>
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#17224D]">
                <Trans>Attendance Tracking</Trans>
              </h1>
              <p className="text-[#363942]/70">{course.title}</p>
            </div>
          </div>
          <p className="text-[#363942]/70">
            <Trans>Mark and track student attendance for each class session</Trans>
          </p>
        </div>

        {/* Attendance Manager */}
        <AttendanceManager
          students={studentsWithAttendance}
          courseId={id}
          locale={locale}
        />
      </div>
    </div>
  );
}
