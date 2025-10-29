import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, students, enrollments } from '@/lib/drizzle/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { StudentsDataTable } from '@/components/admin/StudentsDataTable';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function StudentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  const studentsList = await db
    .select({
      userId: students.userId,
      suid: students.suid,
      name: users.name,
      email: users.email,
      phone: users.phone,
      gender: students.gender,
      photo: students.photo,
      enrolled: students.enrolled,
      isActive: users.isActive,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id));

  // Get enrollment counts for each student
  const enrollmentCounts = await db
    .select({
      studentId: enrollments.studentId,
      count: count(),
    })
    .from(enrollments)
    .groupBy(enrollments.studentId);

  const enrollmentMap = new Map(
    enrollmentCounts.map((e) => [e.studentId, e.count])
  );

  // Add enrollment count to student data
  const studentsWithEnrollments = studentsList.map(student => ({
    ...student,
    enrollmentCount: enrollmentMap.get(student.userId) || 0,
  }));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#17224D] mb-2">
              <Trans>Students Management</Trans>
            </h2>
            <p className="text-[#363942]/70">
              <Trans>View and manage student accounts</Trans>
            </p>
          </div>
          <Link
            href={`/${locale}/admin/students/new`}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-xl hover:shadow-xl transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            <Trans>Add Student</Trans>
          </Link>
        </div>

        <StudentsDataTable data={studentsWithEnrollments} locale={locale} />
      </div>
    </div>
  );
}
