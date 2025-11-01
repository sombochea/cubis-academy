import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { Trans } from '@lingui/react/macro';
import { ArrowLeft, BookOpen, Copy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function DuplicateCoursePage({
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

  // Get teacher's courses
  const teacherCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      desc: courses.desc,
      category: courses.category,
      level: courses.level,
      isActive: courses.isActive,
    })
    .from(courses)
    .where(eq(courses.teacherId, session.user.id))
    .orderBy(courses.created);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={`/${locale}/teacher/courses`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <Trans>Back to Courses</Trans>
          </Button>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Copy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#17224D]">
                <Trans>Duplicate Course</Trans>
              </h1>
              <p className="text-sm text-[#363942]/70">
                <Trans>Select a course to duplicate</Trans>
              </p>
            </div>
          </div>
        </div>

        {/* Course List */}
        {teacherCourses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-[#363942]/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#17224D] mb-2">
              <Trans>No courses to duplicate</Trans>
            </h3>
            <p className="text-[#363942]/70 mb-6">
              <Trans>Create your first course before duplicating</Trans>
            </p>
            <Link href={`/${locale}/teacher/courses/new`}>
              <Button className="bg-[#007FFF] hover:bg-[#0066CC]">
                <BookOpen className="w-4 h-4 mr-2" />
                <Trans>Create Course</Trans>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {teacherCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:border-[#007FFF]/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#17224D] mb-2">
                      {course.title}
                    </h3>
                    {course.desc && (
                      <p className="text-sm text-[#363942]/70 mb-3 line-clamp-2">
                        {course.desc}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {course.category && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold capitalize">
                          {course.category}
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold capitalize">
                        {course.level}
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
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled
                    >
                      <Copy className="w-4 h-4" />
                      <Trans>Duplicate</Trans>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>
              <Trans>Coming Soon</Trans>:
            </strong>{' '}
            <Trans>
              Course duplication feature is under development. You'll be able to
              duplicate courses with all their content, schedules, and materials.
            </Trans>
          </p>
        </div>
      </div>
    </div>
  );
}
