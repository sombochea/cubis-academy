import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { payments, students, courses, users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, BookOpen, Calendar, DollarSign, CreditCard, FileText, CheckCircle, XCircle } from 'lucide-react';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function PaymentDetailsPage({ 
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

  // Get payment details
  const paymentData = await db
    .select()
    .from(payments)
    .innerJoin(students, eq(payments.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .leftJoin(courses, eq(payments.courseId, courses.id))
    .where(eq(payments.id, id))
    .limit(1);

  if (!paymentData || paymentData.length === 0) {
    redirect(`/${locale}/admin/payments`);
  }

  const paymentRow = paymentData[0];
  const payment = {
    id: paymentRow.payments.id,
    studentId: paymentRow.students.userId,
    studentName: paymentRow.users.name,
    studentEmail: paymentRow.users.email,
    studentSuid: paymentRow.students.suid,
    studentPhoto: paymentRow.students.photo,
    courseId: paymentRow.courses?.id || null,
    courseTitle: paymentRow.courses?.title || null,
    courseCategory: paymentRow.courses?.category || null,
    coursePrice: paymentRow.courses?.price || null,
    amount: paymentRow.payments.amount,
    method: paymentRow.payments.method,
    status: paymentRow.payments.status,
    txnId: paymentRow.payments.txnId,
    notes: paymentRow.payments.notes,
    proofUrl: paymentRow.payments.proofUrl,
    created: paymentRow.payments.created,
    updated: paymentRow.payments.updated,
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/${locale}/admin/payments`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <Trans>Back to Payments</Trans>
            </Button>
          </Link>
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Payment Details</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>View payment transaction information</Trans>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-[#17224D] mb-4">
                <Trans>Payment Information</Trans>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transaction ID */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-[#363942]/70 mb-2">
                    <FileText className="w-4 h-4" />
                    <Trans>Transaction ID</Trans>
                  </div>
                  <p className="font-mono text-[#007FFF] font-medium">
                    {payment.txnId || '-'}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-[#363942]/70 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <Trans>Amount</Trans>
                  </div>
                  <p className="text-2xl font-bold text-[#17224D]">
                    ${Number(payment.amount).toFixed(2)}
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-[#363942]/70 mb-2">
                    <CreditCard className="w-4 h-4" />
                    <Trans>Payment Method</Trans>
                  </div>
                  <p className="font-medium text-[#17224D] capitalize">
                    {payment.method || '-'}
                  </p>
                </div>

                {/* Date */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-[#363942]/70 mb-2">
                    <Calendar className="w-4 h-4" />
                    <Trans>Payment Date</Trans>
                  </div>
                  <p className="font-medium text-[#17224D]">
                    {new Date(payment.created).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {payment.notes && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-[#363942]/70 mb-2">
                    <Trans>Notes</Trans>
                  </p>
                  <p className="text-[#363942]">{payment.notes}</p>
                </div>
              )}

              {/* Proof of Payment */}
              {payment.proofUrl && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-[#363942]/70 mb-3">
                    <Trans>Proof of Payment</Trans>
                  </p>
                  <a 
                    href={payment.proofUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#007FFF] hover:underline flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <Trans>View attachment</Trans>
                  </a>
                </div>
              )}
            </div>

            {/* Student & Course Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-[#17224D] mb-4">
                <Trans>Related Information</Trans>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-[#363942]/70 mb-2">
                    <User className="w-4 h-4" />
                    <Trans>Student</Trans>
                  </div>
                  <Link 
                    href={`/${locale}/admin/students/${payment.studentId}`}
                    className="text-[#007FFF] hover:underline font-medium"
                  >
                    {payment.studentName}
                  </Link>
                  <p className="text-sm text-[#363942]/70 font-mono">{payment.studentSuid}</p>
                  <p className="text-sm text-[#363942]/70">{payment.studentEmail}</p>
                </div>

                {/* Course */}
                {payment.courseId && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-[#363942]/70 mb-2">
                      <BookOpen className="w-4 h-4" />
                      <Trans>Course</Trans>
                    </div>
                    <Link 
                      href={`/${locale}/admin/courses/${payment.courseId}`}
                      className="text-[#007FFF] hover:underline font-medium"
                    >
                      {payment.courseTitle}
                    </Link>
                    <p className="text-sm text-[#363942]/70">{payment.courseCategory}</p>
                    <p className="text-sm text-[#363942]/70">
                      <Trans>Price:</Trans> ${Number(payment.coursePrice).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#363942]/70 mb-3">
                <Trans>Payment Status</Trans>
              </h3>
              <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                payment.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : payment.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : payment.status === 'failed'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                <Trans>{payment.status}</Trans>
              </span>
            </div>

            {/* Actions */}
            {payment.status === 'pending' && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-[#363942]/70 mb-4">
                  <Trans>Actions</Trans>
                </h3>
                <div className="space-y-3">
                  <Link href={`/${locale}/admin/payments/${payment.id}/approve`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <Trans>Approve Payment</Trans>
                    </Button>
                  </Link>
                  <Link href={`/${locale}/admin/payments/${payment.id}/reject`}>
                    <Button variant="destructive" className="w-full">
                      <XCircle className="mr-2 h-4 w-4" />
                      <Trans>Reject Payment</Trans>
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#363942]/70 mb-4">
                <Trans>Timeline</Trans>
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-[#007FFF] rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-[#17224D]">
                      <Trans>Payment Created</Trans>
                    </p>
                    <p className="text-xs text-[#363942]/70">
                      {new Date(payment.created).toLocaleString()}
                    </p>
                  </div>
                </div>
                {payment.updated && payment.updated !== payment.created && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-[#007FFF] rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium text-[#17224D]">
                        <Trans>Last Updated</Trans>
                      </p>
                      <p className="text-xs text-[#363942]/70">
                        {new Date(payment.updated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
