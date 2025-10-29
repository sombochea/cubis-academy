import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, teachers, courses } from '@/lib/drizzle/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { TeachersDataTable } from '@/components/admin/TeachersDataTable';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function TeachersPage({ params }: { params: Promise<{ locale: string }> }) {
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
      email: users.email,
      phone: users.phone,
      bio: teachers.bio,
      spec: teachers.spec,
      photo: teachers.photo,
      isActive: users.isActive,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id));

  // Get course counts for each teacher
  const courseCounts = await db
    .select({
      teacherId: courses.teacherId,
      count: count(),
    })
    .from(courses)
    .groupBy(courses.teacherId);

  const courseCountMap = new Map(
    courseCounts.map((c) => [c.teacherId, c.count])
  );

  // Add course count to teacher data
  const teachersWithCourses = teachersList.map(teacher => ({
    ...teacher,
    courseCount: courseCountMap.get(teacher.userId) || 0,
  }));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#17224D] mb-2">
              <Trans>Teachers Management</Trans>
            </h2>
            <p className="text-[#363942]/70">
              <Trans>Manage teachers and assign courses</Trans>
            </p>
          </div>
          <Link
            href={`/${locale}/admin/teachers/new`}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-xl hover:shadow-xl transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            <Trans>Add Teacher</Trans>
          </Link>
        </div>

        <TeachersDataTable data={teachersWithCourses} locale={locale} />
      </div>
    </div>
  );
}
