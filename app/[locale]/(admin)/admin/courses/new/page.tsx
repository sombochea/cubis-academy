import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, teachers } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { AdminNav } from '@/components/admin/AdminNav';
import { CourseForm } from '@/components/admin/CourseForm';
import { Trans } from '@lingui/react/macro';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function NewCoursePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  const teachersList = await db
    .select({
      userId: teachers.userId,
      name: users.name,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(eq(users.isActive, true));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Add New Course</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Create a new course in the catalog</Trans>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <CourseForm locale={locale} teachers={teachersList} />
        </div>
      </div>
    </div>
  );
}
