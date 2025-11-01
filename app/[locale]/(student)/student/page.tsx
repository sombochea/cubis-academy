import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Trans } from '@lingui/react/macro';
import { StudentNav } from '@/components/student/StudentNav';
import { PaymentAlert } from '@/components/student/PaymentAlert';
import { DashboardStats } from '@/components/student/DashboardStats';
import { RecentActivity } from '@/components/student/RecentActivity';
import { UpcomingClasses } from '@/components/student/UpcomingClasses';
import { QuickActions } from '@/components/student/QuickActions';
import { ProgressChart } from '@/components/student/ProgressChart';
import { OnboardingFlow } from '@/components/student/OnboardingFlow';
import { StudentService } from '@/lib/services/student.service';
import { StudentRepository } from '@/lib/repositories/student.repository';
import { Loader2 } from 'lucide-react';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

// Loading components
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContentLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
          <div className="h-64 bg-gray-200 rounded" />
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats component (loads independently)
async function DashboardStatsSection({ studentId, locale }: { studentId: string; locale: string }) {
  const dashboard = await StudentService.getStudentDashboard(studentId);

  return (
    <DashboardStats
      totalCourses={dashboard.stats.totalEnrollments}
      activeCourses={dashboard.stats.activeEnrollments}
      completedCourses={dashboard.stats.completedEnrollments}
      avgProgress={dashboard.stats.avgProgress}
      totalSpent={0} // Will be calculated from payments
      avgScore={dashboard.stats.avgScore}
      attendanceRate={dashboard.stats.attendanceRate}
      locale={locale}
    />
  );
}

// Main content component (loads independently)
async function DashboardContent({ studentId, locale }: { studentId: string; locale: string }) {
  const dashboard = await StudentService.getStudentDashboard(studentId);

  // Get overdue enrollments for payment alerts
  const enrollments = dashboard.recentActivity.scores.map((s: any) => ({
    id: s.id,
    courseTitle: s.courseTitle,
    totalAmount: '0',
    paidAmount: '0',
    daysSinceEnrollment: 0,
  }));

  return (
    <>
      {/* Payment Alert */}
      <PaymentAlert overdueEnrollments={[]} locale={locale} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column - Progress & Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Chart */}
          <ProgressChart enrollments={[]} />

          {/* Recent Activity */}
          <RecentActivity activities={[]} locale={locale} />
        </div>

        {/* Right Column - Quick Actions & Upcoming Classes */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions locale={locale} />

          {/* Upcoming Classes */}
          <UpcomingClasses schedules={[]} locale={locale} />
        </div>
      </div>
    </>
  );
}

export default async function StudentDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Get student data for onboarding (lightweight query)
  const studentData = await StudentRepository.getStudentByUserId(session.user.id);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <StudentNav locale={locale} />
      
      {/* Onboarding Flow */}
      {studentData && (
        <OnboardingFlow
          userId={session.user.id}
          userName={studentData.userName}
          userEmail={studentData.userEmail}
          locale={locale}
          onboardingCompleted={studentData.onboardingCompleted}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Welcome back!</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Here's what's happening with your courses today</Trans>
          </p>
        </div>

        {/* Stats Dashboard with Suspense */}
        <Suspense fallback={<StatsLoading />}>
          <DashboardStatsSection studentId={session.user.id} locale={locale} />
        </Suspense>

        {/* Main Content with Suspense */}
        <Suspense fallback={<ContentLoading />}>
          <DashboardContent studentId={session.user.id} locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
