import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { EnrollmentsDataTable } from '@/components/admin/EnrollmentsDataTable';
import { EnrollmentService } from '@/lib/services/enrollment.service';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

// Loading component
function TableLoading() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Data fetching component
async function EnrollmentsTable({ locale }: { locale: string }) {
  const enrollmentsList = await EnrollmentService.getAllEnrollmentsWithDetails();
  return <EnrollmentsDataTable data={enrollmentsList} locale={locale} />;
}

export default async function EnrollmentsPage({ params }: { params: Promise<{ locale: string }> }) {
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header renders immediately */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Enrollments Management</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Manage student course enrollments and track progress</Trans>
          </p>
        </div>

        {/* Table loads independently with Suspense */}
        <Suspense fallback={<TableLoading />}>
          <EnrollmentsTable locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
