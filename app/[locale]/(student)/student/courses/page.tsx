import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, users, teachers } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { StudentNav } from '@/components/student/StudentNav';
import { CoursesGrid } from '@/components/student/CoursesGrid';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

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

  // Get all active courses with teacher info
  const coursesList = await db
    .select({
      id: courses.id,
      title: courses.title,
      desc: courses.desc,
      category: courses.category,
      price: courses.price,
      duration: courses.duration,
      level: courses.level,
      isActive: courses.isActive,
      teacherName: users.name,
      teacherSpec: teachers.spec,
    })
    .from(courses)
    .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(eq(courses.isActive, true));

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

        <CoursesGrid courses={coursesList} locale={locale} />
      </div>
    </div>
  );
}
