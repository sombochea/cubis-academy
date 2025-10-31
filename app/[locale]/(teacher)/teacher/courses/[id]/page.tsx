import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, enrollments, users, students, classSchedules } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { Trans } from '@lingui/react/macro';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Edit,
  Settings,
  Award,
  CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function TeacherCourseDetailsPage({
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

  // Get course details
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
      id: enrollments.id,
      studentId: students.userId,
      studentName: users.name,
      studentEmail: users.email,
      progress: enrollments.progress,
      status: enrollments.status,
      enrolled: enrollments.enrolled,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(enrollments.courseId, id))
    .orderBy(enrollments.enrolled);

  // Get class schedules
  const schedules = await db
    .select()
    .from(classSchedules)
    .where(
      and(eq(classSchedules.courseId, id), eq(classSchedules.isActive, true))
    );

  const levelConfig = {
    beginner: { label: 'Beginner', color: 'from-green-500 to-emerald-500' },
    intermediate: {
      label: 'Intermediate',
      color: 'from-yellow-500 to-orange-500',
    },
    advanced: { label: 'Advanced', color: 'from-red-500 to-pink-500' },
  };

  const level = levelConfig[course.level];

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={`/${locale}/teacher/courses`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <Trans>Back to Courses</Trans>
          </Button>
        </Link>

        {/* Course Header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#007FFF] via-[#17224D] to-[#007FFF]"></div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#17224D] mb-2">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {course.category && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold capitalize">
                      {course.category}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-1 bg-gradient-to-r ${level.color} text-white rounded-full text-xs font-semibold`}
                  >
                    {level.label}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      course.isActive
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {course.isActive ? (
                      <Trans>Active</Trans>
                    ) : (
                      <Trans>Inactive</Trans>
                    )}
                  </span>
                  {course.deliveryMode && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs font-medium">
                      <Monitor className="w-3 h-3" />
                      <span className="capitalize">{course.deliveryMode}</span>
                    </span>
                  )}
                  {course.duration && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/${locale}/teacher/courses/${id}/edit`}>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Edit className="w-4 h-4" />
                    <Trans>Edit</Trans>
                  </Button>
                </Link>
                <Link href={`/${locale}/teacher/courses/${id}/scores`}>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Award className="w-4 h-4" />
                    <Trans>Grades</Trans>
                  </Button>
                </Link>
                <Link href={`/${locale}/teacher/courses/${id}/attendance`}>
                  <Button size="sm" variant="outline" className="gap-2">
                    <CalendarCheck className="w-4 h-4" />
                    <Trans>Attendance</Trans>
                  </Button>
                </Link>
                <Link href={`/${locale}/teacher/courses/${id}/settings`}>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    <Trans>Settings</Trans>
                  </Button>
                </Link>
              </div>
            </div>

            {course.desc && (
              <p className="text-sm text-[#363942]/70 mb-4">{course.desc}</p>
            )}

            {course.location && (
              <div className="flex items-center gap-2 text-sm text-[#363942]/70">
                <MapPin className="w-4 h-4 text-[#007FFF]" />
                <span>{course.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrolled Students */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#17224D] flex items-center gap-2">
                <Users className="w-5 h-5" />
                <Trans>Enrolled Students</Trans> ({enrolledStudents.length})
              </h2>
            </div>

            {enrolledStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-[#363942]/20 mx-auto mb-4" />
                <p className="text-[#363942]/70">
                  <Trans>No students enrolled yet</Trans>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrolledStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-[#F4F5F7] rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-[#17224D]">
                        {student.studentName}
                      </p>
                      <p className="text-sm text-[#363942]/70">
                        {student.studentEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#007FFF]">
                        {student.progress}% <Trans>complete</Trans>
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                          student.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Class Schedule */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#17224D] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <Trans>Schedule</Trans>
              </h2>
              <Link
                href={`/${locale}/admin/courses/${id}/schedules`}
                className="text-sm text-[#007FFF] hover:text-[#0066CC] font-medium"
              >
                <Trans>Manage</Trans>
              </Link>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-[#363942]/20 mx-auto mb-3" />
                <p className="text-sm text-[#363942]/70">
                  <Trans>No schedule set</Trans>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-3 bg-[#F4F5F7] rounded-lg"
                  >
                    <div className="font-semibold text-[#17224D] text-sm capitalize mb-1">
                      {schedule.dayOfWeek}
                    </div>
                    <div className="text-sm text-[#363942]/70">
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                    {schedule.location && (
                      <div className="text-xs text-[#363942]/70 mt-1">
                        {schedule.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
