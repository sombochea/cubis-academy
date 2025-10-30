import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/drizzle/queries';
import { db } from '@/lib/drizzle/db';
import { enrollments, courses, payments } from '@/lib/drizzle/schema';
import { eq, and, count, desc, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import { StudentNav } from '@/components/student/StudentNav';
import { 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  DollarSign,
  Clock,
  Award,
  ArrowRight
} from 'lucide-react';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

async function getEnrollmentCount(userId: string) {
  const result = await db.select({ count: count() })
    .from(enrollments)
    .where(eq(enrollments.studentId, userId));
  return result[0]?.count || 0;
}

async function getCompletedCount(userId: string) {
  const result = await db.select({ count: count() })
    .from(enrollments)
    .where(and(
      eq(enrollments.studentId, userId),
      eq(enrollments.status, 'completed')
    ));
  return result[0]?.count || 0;
}

async function getActiveCount(userId: string) {
  const result = await db.select({ count: count() })
    .from(enrollments)
    .where(and(
      eq(enrollments.studentId, userId),
      eq(enrollments.status, 'active')
    ));
  return result[0]?.count || 0;
}

export default async function StudentDashboard({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const user = await getUserById(session.user.id);
  
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Get stats
  const enrollmentCount = user.student ? await getEnrollmentCount(user.id) : 0;
  const completedCount = user.student ? await getCompletedCount(user.id) : 0;
  const activeCount = user.student ? await getActiveCount(user.id) : 0;
  
  // Get recent enrollments
  const recentEnrollments = user.student ? await db
    .select({
      id: enrollments.id,
      courseTitle: courses.title,
      courseCategory: courses.category,
      status: enrollments.status,
      progress: enrollments.progress,
      enrolled: enrollments.enrolled,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, user.id))
    .orderBy(desc(enrollments.enrolled))
    .limit(5) : [];

  // Get total spent
  const [totalSpent] = user.student ? await db
    .select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(and(
      eq(payments.studentId, user.id),
      eq(payments.status, 'completed')
    )) : [{ total: 0 }];

  const stats = [
    {
      title: <Trans>Total Courses</Trans>,
      value: enrollmentCount,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      href: `/${locale}/student/enrollments`,
    },
    {
      title: <Trans>Completed</Trans>,
      value: completedCount,
      icon: Award,
      color: 'from-green-500 to-emerald-500',
      href: `/${locale}/student/enrollments`,
    },
    {
      title: <Trans>In Progress</Trans>,
      value: activeCount,
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
      href: `/${locale}/student/enrollments`,
    },
    {
      title: <Trans>Total Spent</Trans>,
      value: `$${Number(totalSpent.total).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-orange-500 to-red-500',
      href: `/${locale}/student/payments`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <StudentNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Welcome back, {user.name}!</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Student ID:</Trans> {user.student?.suid}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link 
                key={index}
                href={stat.href}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-[#363942]/70 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-[#17224D]">{stat.value}</p>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#17224D]">
                  <Trans>Recent Courses</Trans>
                </h3>
                <Link 
                  href={`/${locale}/student/enrollments`}
                  className="text-sm text-[#007FFF] hover:underline flex items-center gap-1"
                >
                  <Trans>View all</Trans>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {recentEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {recentEnrollments.map((enrollment) => (
                    <Link
                      key={enrollment.id}
                      href={`/${locale}/student/enrollments`}
                      className="flex items-center justify-between p-4 bg-[#F4F5F7] rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-[#17224D] mb-1">
                          {enrollment.courseTitle}
                        </h4>
                        <p className="text-sm text-[#363942]/70">
                          {enrollment.courseCategory}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#363942]">
                            {enrollment.progress}%
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            enrollment.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : enrollment.status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            <Trans>{enrollment.status}</Trans>
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#363942]/40" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="w-12 h-12 text-[#363942]/20 mx-auto mb-3" />
                  <p className="text-[#363942]/70 mb-4">
                    <Trans>No courses enrolled yet</Trans>
                  </p>
                  <Link href={`/${locale}/student/courses`}>
                    <button className="px-4 py-2 bg-[#007FFF] text-white rounded-lg hover:bg-[#007FFF]/90 transition-colors">
                      <Trans>Browse Courses</Trans>
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#17224D] mb-4">
                <Trans>Quick Actions</Trans>
              </h3>
              <div className="space-y-3">
                <Link
                  href={`/${locale}/student/courses`}
                  className="flex items-center gap-3 p-3 bg-[#F4F5F7] rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-[#007FFF]" />
                  <span className="text-sm font-medium text-[#17224D]">
                    <Trans>Browse Courses</Trans>
                  </span>
                </Link>
                <Link
                  href={`/${locale}/student/payments/new`}
                  className="flex items-center gap-3 p-3 bg-[#F4F5F7] rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <DollarSign className="w-5 h-5 text-[#007FFF]" />
                  <span className="text-sm font-medium text-[#17224D]">
                    <Trans>Make Payment</Trans>
                  </span>
                </Link>
                <Link
                  href={`/${locale}/student/profile`}
                  className="flex items-center gap-3 p-3 bg-[#F4F5F7] rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-[#007FFF]" />
                  <span className="text-sm font-medium text-[#17224D]">
                    <Trans>View Profile</Trans>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
