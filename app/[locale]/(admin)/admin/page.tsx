import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, BookOpen, DollarSign, GraduationCap, TrendingUp, UserCheck } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { VerificationStatsWidget } from '@/components/admin/VerificationStatsWidget';
import { QuickActionsMenu } from '@/components/admin/QuickActionsMenu';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

// Loading components
function StatsLoading() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
          <div className="h-8 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

function WidgetLoading() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200 rounded" />
    </div>
  );
}

// Stats component (loads independently)
async function DashboardStats({ locale }: { locale: string }) {
  const overview = await AnalyticsService.getAdminDashboardOverview();

  const stats = [
    {
      title: 'Total Students',
      value: overview.counts.students,
      icon: Users,
      color: 'from-[#007FFF] to-[#0066CC]',
      href: `/${locale}/admin/students`,
    },
    {
      title: 'Total Teachers',
      value: overview.counts.teachers,
      icon: GraduationCap,
      color: 'from-[#17224D] to-[#363942]',
      href: `/${locale}/admin/teachers`,
    },
    {
      title: 'Total Courses',
      value: overview.users.students + overview.users.teachers, // Placeholder
      icon: BookOpen,
      color: 'from-[#007FFF] to-[#17224D]',
      href: `/${locale}/admin/courses`,
    },
    {
      title: 'Active Enrollments',
      value: overview.users.active,
      icon: UserCheck,
      color: 'from-[#17224D] to-[#007FFF]',
      href: `/${locale}/admin/enrollments`,
    },
    {
      title: 'Total Revenue',
      value: `$${Number(overview.payments.totalAmount).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-[#007FFF] to-[#0066CC]',
      href: `/${locale}/admin/payments`,
    },
    {
      title: 'Pending Payments',
      value: overview.payments.pendingPayments,
      icon: TrendingUp,
      color: 'from-[#17224D] to-[#363942]',
      href: `/${locale}/admin/payments`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {stats.map((stat) => (
        <Link
          key={stat.title}
          href={stat.href}
          className="group bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-[#007FFF] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-3xl font-bold text-[#17224D] mb-1">{stat.value}</div>
          <div className="text-sm text-[#363942]/70 font-medium">
            <Trans>{stat.title}</Trans>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
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
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#17224D] mb-2">
              <Trans>Admin Dashboard</Trans>
            </h2>
            <p className="text-[#363942]/70">
              <Trans>Manage your learning management system</Trans>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <QuickActionsMenu locale={locale} />
          </div>
        </div>

        {/* Stats with Suspense */}
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats locale={locale} />
        </Suspense>

        {/* Email Verification Stats with Suspense */}
        <Suspense fallback={<WidgetLoading />}>
          <VerificationStatsWidget />
        </Suspense>
      </div>
    </div>
  );
}
