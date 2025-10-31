import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, courseCategories } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { CourseEditForm } from '@/components/teacher/CourseEditForm';
import { Trans } from '@lingui/react/macro';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function EditCoursePage({
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

  // Get course details with category
  const [courseData] = await db
    .select({
      id: courses.id,
      title: courses.title,
      desc: courses.desc,
      category: courses.category,
      categoryId: courses.categoryId,
      categorySlug: courseCategories.slug,
      level: courses.level,
      price: courses.price,
      duration: courses.duration,
      deliveryMode: courses.deliveryMode,
      location: courses.location,
      youtubeUrl: courses.youtubeUrl,
      zoomUrl: courses.zoomUrl,
      isActive: courses.isActive,
    })
    .from(courses)
    .leftJoin(courseCategories, eq(courses.categoryId, courseCategories.id))
    .where(and(eq(courses.id, id), eq(courses.teacherId, session.user.id)));

  if (!courseData) {
    notFound();
  }

  // Get all active course categories
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          {/* Gradient Bar */}
          <div className="h-2 bg-gradient-to-r from-[#007FFF] via-[#17224D] to-[#007FFF]"></div>
          
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/${locale}/teacher/courses/${id}`}>
                  <Button variant="ghost" size="sm" className="mb-3 -ml-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <Trans>Back to Course</Trans>
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-[#17224D] mb-2">
                  <Trans>Edit Course</Trans>
                </h1>
                <p className="text-[#363942]/70">
                  <Trans>Update your course information and settings</Trans>
                </p>
              </div>
              
              {/* Course Info Badge */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">
                  {courseData.title}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CourseEditForm course={courseData} categories={categories} locale={locale} />
        </div>
      </div>
    </div>
  );
}
