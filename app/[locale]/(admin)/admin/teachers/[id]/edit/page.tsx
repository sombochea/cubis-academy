import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, teachers } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { TeacherForm } from '@/components/admin/TeacherForm';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function EditTeacherPage({ 
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

  const [teacher] = await db
    .select({
      userId: teachers.userId,
      name: users.name,
      email: users.email,
      phone: users.phone,
      bio: teachers.bio,
      spec: teachers.spec,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(eq(teachers.userId, id));

  if (!teacher) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/admin/teachers/${id}`}
            className="inline-flex items-center gap-2 text-[#007FFF] hover:text-[#0066CC] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <Trans>Back to Teacher</Trans>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Edit Teacher</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Update teacher information</Trans>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <TeacherForm 
            locale={locale} 
            teacherId={id}
            initialData={{
              name: teacher.name,
              email: teacher.email,
              phone: teacher.phone || '',
              password: '',
              bio: teacher.bio || '',
              spec: teacher.spec || '',
            }}
          />
        </div>
      </div>
    </div>
  );
}
