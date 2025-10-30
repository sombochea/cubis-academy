import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import {
  enrollments,
  courses,
  scores,
  attendances,
  payments,
  classSchedules,
} from '@/lib/drizzle/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { StudentNav } from '@/components/student/StudentNav';
import { PaymentAlert } from '@/components/student/PaymentAlert';
import { DashboardStats } from '@/components/student/DashboardStats';
import { RecentActivity } from '@/components/student/RecentActivity';
import { UpcomingClasses } from '@/components/student/UpcomingClasses';
import { QuickActions } from '@/components/student/QuickActions';
import { ProgressChart } from '@/components/student/ProgressChart';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

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

  // Get all enrollments with course details
  const userEnrollments = await db
    .select({
      id: enrollments.id,
      courseId: enrollments.courseId,
      courseTitle: courses.title,
      courseCategory: courses.category,
      courseLevel: courses.level,
      status: enrollments.status,
      progress: enrollments.progress,
      enrolled: enrollments.enrolled,
      totalAmount: enrollments.totalAmount,
      paidAmount: enrollments.paidAmount,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, session.user.id))
    .orderBy(desc(enrollments.enrolled));

  // Get stats
  const totalCourses = userEnrollments.length;
  const activeCourses = userEnrollments.filter((e) => e.status === 'active').length;
  const completedCourses = userEnrollments.filter((e) => e.status === 'completed').length;

  // Calculate average progress
  const avgProgress =
    activeCourses > 0
      ? Math.round(
          userEnrollments
            .filter((e) => e.status === 'active')
            .reduce((sum, e) => sum + e.progress, 0) / activeCourses
        )
      : 0;

  // Get total spent
  const [totalSpentResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)` })
    .from(payments)
    .where(and(eq(payments.studentId, session.user.id), eq(payments.status, 'completed')));

  const totalSpent = Number(totalSpentResult.total);

  // Get average score
  const userScores = await db
    .select({
      score: scores.score,
      maxScore: scores.maxScore,
    })
    .from(scores)
    .innerJoin(enrollments, eq(scores.enrollmentId, enrollments.id))
    .where(eq(enrollments.studentId, session.user.id));

  const avgScore =
    userScores.length > 0
      ? Math.round(
          userScores.reduce(
            (sum, s) => sum + (Number(s.score) / Number(s.maxScore)) * 100,
            0
          ) / userScores.length
        )
      : 0;

  // Get attendance rate
  const userAttendances = await db
    .select({
      status: attendances.status,
    })
    .from(attendances)
    .innerJoin(enrollments, eq(attendances.enrollmentId, enrollments.id))
    .where(eq(enrollments.studentId, session.user.id));

  const attendanceRate =
    userAttendances.length > 0
      ? Math.round(
          (userAttendances.filter((a) => a.status === 'present').length /
            userAttendances.length) *
            100
        )
      : 0;

  // Get overdue enrollments for payment alerts
  const overdueEnrollments = userEnrollments
    .filter(
      (e) =>
        e.status === 'active' &&
        Number(e.totalAmount) > Number(e.paidAmount)
    )
    .map((e) => ({
      ...e,
      daysSinceEnrollment: Math.floor(
        (new Date().getTime() - new Date(e.enrolled).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

  // Get upcoming classes (next 7 days)
  const today = new Date();
  const dayOfWeek = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][today.getDay()];

  const upcomingSchedules = await db
    .select({
      id: classSchedules.id,
      courseId: classSchedules.courseId,
      courseTitle: courses.title,
      dayOfWeek: classSchedules.dayOfWeek,
      startTime: classSchedules.startTime,
      endTime: classSchedules.endTime,
      location: classSchedules.location,
      notes: classSchedules.notes,
    })
    .from(classSchedules)
    .innerJoin(courses, eq(classSchedules.courseId, courses.id))
    .innerJoin(enrollments, eq(courses.id, enrollments.courseId))
    .where(
      and(
        eq(enrollments.studentId, session.user.id),
        eq(enrollments.status, 'active'),
        eq(classSchedules.isActive, true)
      )
    );

  // Get recent activities (scores, attendance, payments)
  const recentScores = await db
    .select({
      type: sql<string>`'score'`,
      title: scores.title,
      courseTitle: courses.title,
      value: sql<string>`CONCAT(${scores.score}, '/', ${scores.maxScore})`,
      date: scores.created,
    })
    .from(scores)
    .innerJoin(enrollments, eq(scores.enrollmentId, enrollments.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, session.user.id))
    .orderBy(desc(scores.created))
    .limit(5);

  const recentAttendances = await db
    .select({
      type: sql<string>`'attendance'`,
      title: sql<string>`'Attendance'`,
      courseTitle: courses.title,
      value: attendances.status,
      date: attendances.date,
    })
    .from(attendances)
    .innerJoin(enrollments, eq(attendances.enrollmentId, enrollments.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, session.user.id))
    .orderBy(desc(attendances.date))
    .limit(5);

  const recentPayments = await db
    .select({
      type: sql<string>`'payment'`,
      title: sql<string>`'Payment'`,
      courseTitle: courses.title,
      value: sql<string>`CONCAT('$', ${payments.amount})`,
      date: payments.created,
    })
    .from(payments)
    .innerJoin(courses, eq(payments.courseId, courses.id))
    .where(and(eq(payments.studentId, session.user.id), eq(payments.status, 'completed')))
    .orderBy(desc(payments.created))
    .limit(5);

  // Combine and sort activities
  const allActivities = [...recentScores, ...recentAttendances, ...recentPayments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <StudentNav locale={locale} />

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

        {/* Payment Alert */}
        <PaymentAlert overdueEnrollments={overdueEnrollments} locale={locale} />

        {/* Stats Dashboard */}
        <DashboardStats
          totalCourses={totalCourses}
          activeCourses={activeCourses}
          completedCourses={completedCourses}
          avgProgress={avgProgress}
          totalSpent={totalSpent}
          avgScore={avgScore}
          attendanceRate={attendanceRate}
          locale={locale}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Progress & Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Chart */}
            <ProgressChart enrollments={userEnrollments} />

            {/* Recent Activity */}
            <RecentActivity activities={allActivities} locale={locale} />
          </div>

          {/* Right Column - Quick Actions & Upcoming Classes */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions locale={locale} />

            {/* Upcoming Classes */}
            <UpcomingClasses schedules={upcomingSchedules} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
