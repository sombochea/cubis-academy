import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { teachers, courses, enrollments, scores, attendances, users } from '@/lib/drizzle/schema';
import { eq, and, count, sql } from 'drizzle-orm';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { Trans } from '@lingui/react/macro';
import {
  BookOpen,
  Users,
  Award,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function TeacherDashboard({
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

  // Get teacher data
  const [teacherData] = await db
    .select({
      userId: teachers.userId,
      bio: teachers.bio,
      spec: teachers.spec,
      schedule: teachers.schedule,
      photo: teachers.photo,
      userName: users.name,
      userEmail: users.email,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(eq(teachers.userId, session.user.id));

  if (!teacherData) {
    redirect(`/${locale}/login`);
  }

  // Get teacher's courses
  const teacherCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      category: courses.category,
      level: courses.level,
      isActive: courses.isActive,
    })
    .from(courses)
    .where(eq(courses.teacherId, session.user.id));

  // Get total students across all courses
  const totalStudentsResult = await db
    .select({ count: count() })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(
        eq(courses.teacherId, session.user.id),
        eq(enrollments.status, 'active')
      )
    );

  const totalStudents = totalStudentsResult[0]?.count || 0;

  // Get recent enrollments
  const recentEnrollments = await db
    .select({
      id: enrollments.id,
      studentName: users.name,
      courseName: courses.title,
      enrolled: enrollments.enrolled,
      progress: enrollments.progress,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(eq(courses.teacherId, session.user.id))
    .orderBy(sql`${enrollments.enrolled} DESC`)
    .limit(5);

  // Calculate stats
  const activeCourses = teacherCourses.filter((c) => c.isActive).length;
  const totalCourses = teacherCourses.length;

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#17224D] mb-2">
                <Trans>Welcome back, {teacherData.userName}!</Trans>
              </h1>
              <p className="text-[#363942]/70">
                <Trans>Here's what's happening with your courses today</Trans>
              </p>
            </div>
            {/* <Link
              href={`/${locale}/teacher/profile`}
              className="px-4 py-2 bg-[#007FFF] text-white rounded-lg hover:bg-[#0066CC] transition-colors text-sm font-medium"
            >
              <Trans>View Profile</Trans>
            </Link> */}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href={`/${locale}/teacher/courses`}
            className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#17224D] mb-1">
              {totalCourses}
            </div>
            <div className="text-sm text-[#363942]/70 font-medium">
              <Trans>Total Courses</Trans>
            </div>
            <div className="text-xs text-[#007FFF] mt-2">
              {activeCourses} <Trans>active</Trans>
            </div>
          </Link>

          <Link
            href={`/${locale}/teacher/students`}
            className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#17224D] mb-1">
              {totalStudents}
            </div>
            <div className="text-sm text-[#363942]/70 font-medium">
              <Trans>Total Students</Trans>
            </div>
          </Link>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#17224D] mb-1">
              {recentEnrollments.length}
            </div>
            <div className="text-sm text-[#363942]/70 font-medium">
              <Trans>Recent Enrollments</Trans>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#17224D] mb-1">
              {teacherData.spec || 'N/A'}
            </div>
            <div className="text-sm text-[#363942]/70 font-medium">
              <Trans>Specialization</Trans>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Enrollments */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#17224D] flex items-center gap-2">
                <Users className="w-5 h-5" />
                <Trans>Recent Enrollments</Trans>
              </h2>
              <Link
                href={`/${locale}/teacher/students`}
                className="text-sm text-[#007FFF] hover:text-[#0066CC] font-medium"
              >
                <Trans>View All</Trans>
              </Link>
            </div>

            {recentEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-[#363942]/20 mx-auto mb-4" />
                <p className="text-[#363942]/70">
                  <Trans>No enrollments yet</Trans>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 bg-[#F4F5F7] rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-[#17224D]">
                        {enrollment.studentName}
                      </p>
                      <p className="text-sm text-[#363942]/70">
                        {enrollment.courseName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#007FFF]">
                        {enrollment.progress}% <Trans>complete</Trans>
                      </div>
                      <div className="text-xs text-[#363942]/70">
                        {new Date(enrollment.enrolled).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#17224D] mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <Trans>Quick Actions</Trans>
            </h2>

            <div className="space-y-3">
              <Link
                href={`/${locale}/teacher/courses`}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#17224D] text-sm">
                    <Trans>Manage Courses</Trans>
                  </p>
                  <p className="text-xs text-[#363942]/70">
                    <Trans>View and edit your courses</Trans>
                  </p>
                </div>
              </Link>

              <Link
                href={`/${locale}/teacher/students`}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#17224D] text-sm">
                    <Trans>View Students</Trans>
                  </p>
                  <p className="text-xs text-[#363942]/70">
                    <Trans>Manage student progress</Trans>
                  </p>
                </div>
              </Link>

              <Link
                href={`/${locale}/teacher/profile`}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#17224D] text-sm">
                    <Trans>My Profile</Trans>
                  </p>
                  <p className="text-xs text-[#363942]/70">
                    <Trans>Update your information</Trans>
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
