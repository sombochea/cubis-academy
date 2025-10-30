import { Suspense } from 'react';
import { StudentNav } from '@/components/student/StudentNav';
import { PaymentForm } from '@/components/student/PaymentForm';
import { Trans } from '@lingui/react/macro';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function NewPaymentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <StudentNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/student/payments`}
            className="inline-flex items-center gap-2 text-[#007FFF] hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <Trans>Back to Payments</Trans>
          </Link>
          <h2 className="text-3xl font-bold text-[#17224D]">
            <Trans>Submit Payment</Trans>
          </h2>
          <p className="text-[#363942]/70 mt-2">
            <Trans>Submit your payment details for verification</Trans>
          </p>
        </div>

        {/* Payment Form */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007FFF] mx-auto mb-4"></div>
              <p className="text-[#363942]/70">
                <Trans>Loading payment form...</Trans>
              </p>
            </div>
          }
        >
          <PaymentForm locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
