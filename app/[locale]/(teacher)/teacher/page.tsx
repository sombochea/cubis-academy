import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { TeacherService } from '@/lib/services/teacher.service';
import { Trans } from '@lingui/react/macro';
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

// Loading components
function StatsLoading() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
          <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

function ContentLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Stats component (loads independently)
async function DashboardStats({ teacherId, locale }: { teacherId: string; locale: string }) {
  const dashboard = await TeacherService.getTeacherDashboard(teacherId);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          {dashboard.stats.totalCourses}
        </div>
        <div className="text-sm text-[#363942]/70 font-medium">
          <Trans>Total Courses</Trans>
        </div>
        <div className="text-xs text-[#007FFF] mt-2">
          {dashboard.stats.activeCourses} <Trans>active</Trans>
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
          {dashboard.stats.uniqueStudents}
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
          {dashboard.recentStudents.length}
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
          {dashboard.teacher.spec || 'N/A'}
        </div>
        <div className="text-sm text-[#363942]/70 font-medium">
          <Trans>Specialization</Trans>
        </div>
      </div>
    </div>
  );
}

// Content component (loads independently)
async function DashboardContent({ teacherId, locale }: { teacherId: string; locale: string }) {
  const dashboard = await TeacherService.getTeacherDashboard(teacherId);

  return (
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

        {dashboard.recentStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-[#363942]/20 mx-auto mb-4" />
            <p className="text-[#363942]/70">
              <Trans>No enrollments yet</Trans>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboard.recentStudents.slice(0, 5).map((student) => (
              <div
                key={student.enrollmentId}
                className="flex items-center justify-between p-4 bg-[#F4F5F7] rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-[#17224D]">
                    {student.userName}
                  </p>
                  <p className="text-sm text-[#363942]/70">
                    {student.courseTitle}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[#007FFF]">
                    {student.progress}% <Trans>complete</Trans>
                  </div>
                  <div className="text-xs text-[#363942]/70">
                    {new Date(student.enrolled).toLocaleDateString()}
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
  );
}

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

  // Get teacher name for welcome message (lightweight query)
  const teacher = await TeacherService.getTeacherProfile(session.user.id);

  if (!teacher.teacher) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#17224D] mb-2">
                <Trans>Welcome back, {teacher.teacher.userName}!</Trans>
              </h1>
              <p className="text-[#363942]/70">
                <Trans>Here's what's happening with your courses today</Trans>
              </p>
            </div>
          </div>
        </div>

        {/* Stats with Suspense */}
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats teacherId={session.user.id} locale={locale} />
        </Suspense>

        {/* Content with Suspense */}
        <Suspense fallback={<ContentLoading />}>
          <DashboardContent teacherId={session.user.id} locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
