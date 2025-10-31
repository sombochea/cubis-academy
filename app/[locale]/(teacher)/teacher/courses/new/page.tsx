import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courseCategories } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { CourseCreateForm } from '@/components/teacher/CourseCreateForm';
import { Trans } from '@lingui/react/macro';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function NewCoursePage({
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

  // Fetch active course categories
  const categories = await db
    .select({
      id: courseCategories.id,
      name: courseCategories.name,
      slug: courseCategories.slug,
    })
    .from(courseCategories)
    .where(eq(courseCategories.isActive, true))
    .orderBy(courseCategories.name);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={`/${locale}/teacher/courses`}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            <Trans>Back to Courses</Trans>
          </Button>
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          {/* Gradient Bar */}
          <div className="h-2 bg-gradient-to-r from-[#007FFF] via-[#17224D] to-[#007FFF]"></div>

          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-[#17224D]">
                    <Trans>Create New Course</Trans>
                  </h1>
                </div>
                <p className="text-sm text-[#363942]/70">
                  <Trans>Fill in the course information below to create a new course</Trans>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Create Form */}
        <CourseCreateForm categories={categories} locale={locale} />
      </div>
    </div>
  );
}
