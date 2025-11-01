import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Trans } from '@lingui/react/macro';
import { StudentNav } from '@/components/student/StudentNav';
import { CoursesGrid } from '@/components/student/CoursesGrid';
import { CourseService } from '@/lib/services/course.service';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

// Loading component
function CoursesLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="flex items-center gap-2 pt-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Courses component (loads independently)
async function CoursesList({ locale }: { locale: string }) {
  const coursesWithStats = await CourseService.getCoursesWithStats();

  // Get course counts for each teacher
  const teacherCourseCountsMap = new Map<string, number>();
  for (const course of coursesWithStats) {
    if (course.teacherId) {
      if (!teacherCourseCountsMap.has(course.teacherId)) {
        const count = coursesWithStats.filter(c => c.teacherId === course.teacherId).length;
        teacherCourseCountsMap.set(course.teacherId, count);
      }
    }
  }

  return (
    <CoursesGrid 
      courses={coursesWithStats} 
      locale={locale}
      teacherCourseCountsMap={teacherCourseCountsMap}
    />
  );
}

export default async function CoursesPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <StudentNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Browse Courses</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Explore our course catalog and start learning today</Trans>
          </p>
        </div>

        {/* Courses with Suspense */}
        <Suspense fallback={<CoursesLoading />}>
          <CoursesList locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
