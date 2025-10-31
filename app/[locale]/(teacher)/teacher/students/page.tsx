import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { Trans } from '@lingui/react/macro';
import { Users } from 'lucide-react';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function TeacherStudentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  const session = await auth();

  if (!session?.user || session.user.role !== 'teacher') {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <Users className="w-16 h-16 text-[#007FFF] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#17224D] mb-2">
            <Trans>Students</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Student management features coming soon</Trans>
          </p>
        </div>
      </div>
    </div>
  );
}
