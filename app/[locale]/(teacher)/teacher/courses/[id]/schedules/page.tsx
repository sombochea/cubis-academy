import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, classSchedules } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ScheduleManager } from '@/components/admin/ScheduleManager';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function TeacherCourseSchedulesPage({
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

  // Get course details (verify teacher ownership)
  const [course] = await db
    .select({
      id: courses.id,
      title: courses.title,
      deliveryMode: courses.deliveryMode,
      location: courses.location,
    })
    .from(courses)
    .where(and(eq(courses.id, id), eq(courses.teacherId, session.user.id)));

  if (!course) {
    notFound();
  }

  // Get existing schedules
  const schedules = await db
    .select()
    .from(classSchedules)
    .where(eq(classSchedules.courseId, id))
    .orderBy(classSchedules.dayOfWeek);

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
            <div className="w-12 h-12 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#17224D]">
                <Trans>Class Schedules</Trans>
              </h2>
              <p className="text-[#363942]/70">{course.title}</p>
            </div>
          </div>
          <p className="text-[#363942]/70 mt-2">
            <Trans>Manage weekly class schedules for this course</Trans>
          </p>
        </div>

        {/* Schedule Manager */}
        <ScheduleManager
          courseId={id}
          initialSchedules={schedules}
          deliveryMode={course.deliveryMode}
          defaultLocation={course.location}
          locale={locale}
        />
      </div>
    </div>
  );
}
