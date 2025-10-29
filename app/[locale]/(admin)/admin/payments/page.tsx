import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { payments, students, courses, users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function PaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  const paymentsList = await db
    .select({
      id: payments.id,
      studentName: users.name,
      studentSuid: students.suid,
      courseTitle: courses.title,
      amount: payments.amount,
      method: payments.method,
      status: payments.status,
      txnId: payments.txnId,
      created: payments.created,
    })
    .from(payments)
    .innerJoin(students, eq(payments.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .leftJoin(courses, eq(payments.courseId, courses.id));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Payments Tracking</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>View and manage all payment transactions</Trans>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F5F7] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Transaction ID</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Student</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Course</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Amount</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Method</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Status</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Date</Trans>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paymentsList.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#F4F5F7]/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#007FFF]">
                      {payment.txnId || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      <div>
                        <div className="font-medium text-[#17224D]">{payment.studentName}</div>
                        <div className="text-xs text-[#363942]/70">{payment.studentSuid}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {payment.courseTitle || <span className="text-[#363942]/50"><Trans>General Payment</Trans></span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#17224D]">
                      ${Number(payment.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {payment.method || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <Trans>{payment.status}</Trans>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {new Date(payment.created).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {paymentsList.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#363942]/70">
                <Trans>No payments found.</Trans>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
