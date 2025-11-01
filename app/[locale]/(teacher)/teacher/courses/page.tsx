import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { CoursesDataTable } from '@/components/teacher/CoursesDataTable';
import { CourseActionsMenu } from '@/components/teacher/CourseActionsMenu';
import { CourseService } from '@/lib/services/course.service';
import { Trans } from '@lingui/react/macro';
import { BookOpen, Users, Loader2 } from 'lucide-react';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

// Loading component for stats
function StatsLoading() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Loading component for courses list
function CoursesLoading() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Stats component (can load independently)
async function CourseStats({ teacherId }: { teacherId: string }) {
  const stats = await CourseService.getTeacherDashboardStats(teacherId);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#17224D]">
              {stats.totalCourses}
            </div>
            <div className="text-sm text-[#363942]/70">
              <Trans>Total Courses</Trans>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#17224D]">
              {stats.activeCourses}
            </div>
            <div className="text-sm text-[#363942]/70">
              <Trans>Active Courses</Trans>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#17224D]">
              {stats.activeEnrollments}
            </div>
            <div className="text-sm text-[#363942]/70">
              <Trans>Total Students</Trans>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Courses list component (can load independently)
async function CoursesList({ teacherId, locale }: { teacherId: string; locale: string }) {
  const coursesWithStats = await CourseService.getTeacherCoursesWithStats(teacherId);

  if (coursesWithStats.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <BookOpen className="w-16 h-16 text-[#363942]/20 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#17224D] mb-2">
          <Trans>No courses yet</Trans>
        </h3>
        <p className="text-[#363942]/70 mb-6">
          <Trans>Create your first course to get started</Trans>
        </p>
        <div className="flex justify-center">
          <CourseActionsMenu locale={locale} />
        </div>
      </div>
    );
  }

  return <CoursesDataTable courses={coursesWithStats} locale={locale} />;
}

export default async function TeacherCoursesPage({
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

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#17224D] mb-2">
              <Trans>My Courses</Trans>
            </h1>
            <p className="text-[#363942]/70">
              <Trans>Manage your courses and track student progress</Trans>
            </p>
          </div>
          <CourseActionsMenu locale={locale} />
        </div>

        {/* Stats with Suspense - loads independently */}
        <Suspense fallback={<StatsLoading />}>
          <CourseStats teacherId={session.user.id} />
        </Suspense>

        {/* Courses List with Suspense - loads independently */}
        <Suspense fallback={<CoursesLoading />}>
          <CoursesList teacherId={session.user.id} locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
