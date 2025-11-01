import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { PaymentsDataTable } from '@/components/admin/PaymentsDataTable';
import { PaymentService } from '@/lib/services/payment.service';
import { DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

// Loading components
function StatsLoading() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

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

// Stats component
async function PaymentStats() {
  const { stats } = await PaymentService.getAllPaymentsWithStats();

  const statsData = [
    {
      title: <Trans>Total Revenue</Trans>,
      value: `$${Number(stats.totalAmount).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: <Trans>Pending Amount</Trans>,
      value: `$${Number(stats.pendingAmount).toFixed(2)}`,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: <Trans>Completed Payments</Trans>,
      value: stats.completedPayments,
      icon: CheckCircle,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: <Trans>Pending Payments</Trans>,
      value: stats.pendingPayments,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {statsData.map((stat, index) => {
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
  );
}

// Table component
async function PaymentsTable({ locale }: { locale: string }) {
  const { payments: paymentsList } = await PaymentService.getAllPaymentsWithStats();
  return <PaymentsDataTable data={paymentsList} locale={locale} />;
}

export default async function PaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
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
            <Trans>Payments Management</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Track and manage all payment transactions</Trans>
          </p>
        </div>

        {/* Stats load independently */}
        <Suspense fallback={<StatsLoading />}>
          <PaymentStats />
        </Suspense>

        {/* Table loads independently */}
        <Suspense fallback={<TableLoading />}>
          <PaymentsTable locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
