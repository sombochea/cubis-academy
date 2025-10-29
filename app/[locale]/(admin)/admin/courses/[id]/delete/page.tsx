import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, enrollments } from '@/lib/drizzle/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { DeleteCourseForm } from '@/components/admin/DeleteCourseForm';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function DeleteCoursePage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { locale, id } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  const [course] = await db
    .select({
      id: courses.id,
      title: courses.title,
      category: courses.category,
      level: courses.level,
    })
    .from(courses)
    .where(eq(courses.id, id));

  if (!course) {
    notFound();
  }

  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(enrollments)
    .where(eq(enrollments.courseId, id));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/admin/courses/${id}`}
            className="inline-flex items-center gap-2 text-[#007FFF] hover:text-[#0066CC] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <Trans>Back to Course</Trans>
          </Link>
        </div>

        <div className="bg-white rounded-xl border-2 border-red-200 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-900">
                  <Trans>Delete Course</Trans>
                </h2>
                <p className="text-sm text-red-700">
                  <Trans>This action cannot be undone</Trans>
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#17224D] mb-2">
                <Trans>Course Details</Trans>
              </h3>
              <div className="bg-[#F4F5F7] rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm text-[#363942]/70"><Trans>Title:</Trans> </span>
                  <span className="text-sm font-semibold text-[#17224D]">{course.title}</span>
                </div>
                {course.category && (
                  <div>
                    <span className="text-sm text-[#363942]/70"><Trans>Category:</Trans> </span>
                    <span className="text-sm font-semibold text-[#17224D]">{course.category}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm text-[#363942]/70"><Trans>Level:</Trans> </span>
                  <span className="text-sm font-semibold text-[#17224D]">
                    <Trans>{course.level}</Trans>
                  </span>
                </div>
              </div>
            </div>

            {enrollmentCount.count > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <Trans>Warning: This course has {enrollmentCount.count} active enrollment(s). Deleting it will affect enrolled students.</Trans>
                </p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-[#363942] mb-4">
                <Trans>Are you sure you want to delete this course? This will permanently remove:</Trans>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#363942] ml-4">
                <li><Trans>Course information and materials</Trans></li>
                <li><Trans>All enrollments and student progress</Trans></li>
                <li><Trans>Related scores and attendance records</Trans></li>
              </ul>
            </div>

            <DeleteCourseForm courseId={id} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
