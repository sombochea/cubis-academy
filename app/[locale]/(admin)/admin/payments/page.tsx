import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { payments, students, courses, users, enrollments } from '@/lib/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { PaymentsDataTable } from '@/components/admin/PaymentsDataTable';
import { DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';
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
      studentId: students.userId,
      courseTitle: courses.title,
      courseId: courses.id,
      amount: payments.amount,
      method: payments.method,
      status: payments.status,
      txnId: payments.txnId,
      created: payments.created,
    })
    .from(payments)
    .innerJoin(students, eq(payments.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id));

  // Calculate stats
  const [totalRevenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(eq(payments.status, 'completed'));

  const [pendingAmount] = await db
    .select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(eq(payments.status, 'pending'));

  const completedCount = paymentsList.filter(p => p.status === 'completed').length;
  const pendingCount = paymentsList.filter(p => p.status === 'pending').length;

  const stats = [
    {
      title: <Trans>Total Revenue</Trans>,
      value: `$${Number(totalRevenue.total).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: <Trans>Pending Amount</Trans>,
      value: `$${Number(pendingAmount.total).toFixed(2)}`,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: <Trans>Completed Payments</Trans>,
      value: completedCount,
      icon: CheckCircle,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: <Trans>Pending Payments</Trans>,
      value: pendingCount,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Payments Management</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Track and manage all payment transactions</Trans>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-[#363942]/70 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-[#17224D]">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <PaymentsDataTable data={paymentsList} locale={locale} />
      </div>
    </div>
  );
}
