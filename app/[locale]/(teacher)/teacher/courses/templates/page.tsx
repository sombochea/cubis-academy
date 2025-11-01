import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { Trans } from '@lingui/react/macro';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function CourseTemplatesPage({
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={`/${locale}/teacher/courses`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <Trans>Back to Courses</Trans>
          </Button>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#17224D] mb-2">
            <Trans>Course Templates</Trans>
          </h1>
          <p className="text-[#363942]/70 mb-6">
            <Trans>This feature is coming soon</Trans>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
            <p className="text-sm text-blue-800 mb-2">
              <strong>
                <Trans>Coming Soon</Trans>:
              </strong>
            </p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                <Trans>Pre-built course templates for common subjects</Trans>
              </li>
              <li>
                <Trans>Customizable course structures</Trans>
              </li>
              <li>
                <Trans>Industry-standard curriculum templates</Trans>
              </li>
              <li>
                <Trans>Quick course creation with templates</Trans>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
