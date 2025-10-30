import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { enrollments, students, courses, users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { EnrollmentsDataTable } from '@/components/admin/EnrollmentsDataTable';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function EnrollmentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  const enrollmentsList = await db
    .select({
      id: enrollments.id,
      studentName: users.name,
      studentSuid: students.suid,
      studentId: students.userId,
      courseTitle: courses.title,
      courseId: courses.id,
      status: enrollments.status,
      progress: enrollments.progress,
      enrolled: enrollments.enrolled,
      completed: enrollments.completed,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Enrollments Management</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Manage student course enrollments and track progress</Trans>
          </p>
        </div>

        <EnrollmentsDataTable data={enrollmentsList} locale={locale} />
      </div>
    </div>
  );
}
