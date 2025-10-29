import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import { TeacherForm } from '@/components/admin/TeacherForm';
import { Trans } from '@lingui/react/macro';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function NewTeacherPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Add New Teacher</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Create a new teacher account</Trans>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <TeacherForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
