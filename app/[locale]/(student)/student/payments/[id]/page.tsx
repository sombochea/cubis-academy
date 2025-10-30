import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { payments, courses, enrollments } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { StudentNav } from '@/components/student/StudentNav';
import { PaymentReceipt } from '@/components/student/PaymentReceipt';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Get payment details
  const [paymentData] = await db
    .select({
      id: payments.id,
      studentId: payments.studentId,
      enrollmentId: payments.enrollmentId,
      courseId: payments.courseId,
      courseTitle: courses.title,
      courseCategory: courses.category,
      amount: payments.amount,
      method: payments.method,
      status: payments.status,
      txnId: payments.txnId,
      proofUrl: payments.proofUrl,
      notes: payments.notes,
      created: payments.created,
      totalAmount: enrollments.totalAmount,
      paidAmount: enrollments.paidAmount,
    })
    .from(payments)
    .leftJoin(courses, eq(payments.courseId, courses.id))
    .leftJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
    .where(and(eq(payments.id, id), eq(payments.studentId, session.user.id)));

  if (!paymentData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <StudentNav locale={locale} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/student/payments`}
            className="inline-flex items-center gap-2 text-[#007FFF] hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <Trans>Back to Payments</Trans>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#17224D]">
                <Trans>Payment Details</Trans>
              </h2>
              <p className="text-[#363942]/70 mt-2">
                <Trans>Transaction ID:</Trans> {paymentData.txnId || paymentData.id}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Receipt */}
        <PaymentReceipt payment={paymentData} locale={locale} />
      </div>
    </div>
  );
}
