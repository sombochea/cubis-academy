import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { setI18n } from '@lingui/react/server';
import { Trans } from '@lingui/react/macro';
import { loadCatalog, i18n } from '@/lib/i18n';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { AdminNav } from '@/components/admin/AdminNav';
import {
  Users,
  DollarSign,
  BookOpen,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/unauthorized`);
  }

  // Fetch analytics data in PARALLEL (much faster!)
  const [overview, enrollmentAnalytics, revenueAnalytics] = await Promise.all([
    AnalyticsService.getAdminDashboardOverview(),
    AnalyticsService.getEnrollmentAnalytics(),
    AnalyticsService.getRevenueAnalytics(),
  ]);

  // Prepare chart data
  const chartData = {
    enrollmentTrends: enrollmentAnalytics?.monthlyTrends || [],
    revenueTrends: revenueAnalytics?.monthlyRevenue || [],
    categoryDistribution: enrollmentAnalytics?.byCategory || [],
    performanceMetrics: {
      avgProgress: enrollmentAnalytics?.avgProgress || 0,
      avgScore: 85, // Placeholder - would come from scores analytics
      completionRate: enrollmentAnalytics?.completionRate || 0,
      attendanceRate: 90, // Placeholder - would come from attendance analytics
    },
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Analytics & Reports</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Comprehensive platform analytics and data insights</Trans>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#007FFF] to-[#0066CC] rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#007FFF] opacity-50" />
            </div>
            <div className="text-3xl font-bold text-[#17224D] mb-1">
              {overview.counts?.students || 0}
            </div>
            <div className="text-sm text-[#363942]/70 font-medium">
              <Trans>Total Students</Trans>
            </div>
          </div>

          {/* Total Teachers */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#17224D] to-[#363942] rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#007FFF] opacity-50" />
            </div>
            <div className="text-3xl font-bold text-[#17224D] mb-1">
              {overview.counts?.teachers || 0}
            </div>
            <div className="text-sm text-[#363942]/70 font-medium">
              <Trans>Total Teachers</Trans>
            </div>
          </div>

          {/* Total Enrollments */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#007FFF] opacity-50" />
            </div>
            <div className="text-3xl font-bold text-[#17224D] mb-1">
              {enrollmentAnalytics?.totalEnrollments || 0}
            </div>
            <div className="text-sm text-[#363942]/70 font-medium">
              <Trans>Total Enrollments</Trans>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#007FFF] to-[#0066CC] rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#007FFF] opacity-50" />
            </div>
            <div className="text-3xl font-bold text-[#17224D] mb-1">
              ${(revenueAnalytics?.totalRevenue || 0).toLocaleString()}
            </div>
            <div className="text-sm text-[#363942]/70 font-medium">
              <Trans>Total Revenue</Trans>
            </div>
          </div>
        </div>

        {/* Charts */}
        <AnalyticsCharts data={chartData} />
      </div>
    </div>
  );
}
