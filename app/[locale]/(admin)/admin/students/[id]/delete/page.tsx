import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, students } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { DeleteStudentForm } from '@/components/admin/DeleteStudentForm';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function DeleteStudentPage({ 
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

  const [student] = await db
    .select({
      userId: students.userId,
      suid: students.suid,
      name: users.name,
      email: users.email,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(students.userId, id));

  if (!student) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-red-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              <Trans>Delete Student</Trans>
            </h2>
            <p className="text-[#363942]/70">
              <Trans>This action cannot be undone</Trans>
            </p>
          </div>

          <div className="mb-6 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-[#363942] mb-2">
              <Trans>You are about to delete:</Trans>
            </p>
            <div className="space-y-1">
              <p className="font-semibold text-[#17224D]">{student.name}</p>
              <p className="text-sm text-[#363942]">{student.email}</p>
              <p className="text-sm text-[#363942] font-mono">{student.suid}</p>
            </div>
          </div>

          <DeleteStudentForm locale={locale} studentId={id} studentName={student.name} />
        </div>
      </div>
    </div>
  );
}
