import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, enrollments, payments, teachers, students } from '@/lib/drizzle/schema';
import { count, eq, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Users, BookOpen, DollarSign, GraduationCap, TrendingUp, UserCheck } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { VerificationStatsWidget } from '@/components/admin/VerificationStatsWidget';
import { ExportUnverifiedButton } from '@/components/admin/ExportUnverifiedButton';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  // Get statistics
  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    activeEnrollments,
    totalRevenue,
    pendingPayments,
  ] = await Promise.all([
    db.select({ count: count() }).from(students),
    db.select({ count: count() }).from(teachers),
    db.select({ count: count() }).from(courses),
    db.select({ count: count() }).from(enrollments).where(eq(enrollments.status, 'active')),
    db.select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` }).from(payments).where(eq(payments.status, 'completed')),
    db.select({ count: count() }).from(payments).where(eq(payments.status, 'pending')),
  ]);

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents[0].count,
      icon: Users,
      color: 'from-[#007FFF] to-[#0066CC]',
      href: `/${locale}/admin/students`,
    },
    {
      title: 'Total Teachers',
      value: totalTeachers[0].count,
      icon: GraduationCap,
      color: 'from-[#17224D] to-[#363942]',
      href: `/${locale}/admin/teachers`,
    },
    {
      title: 'Total Courses',
      value: totalCourses[0].count,
      icon: BookOpen,
      color: 'from-[#007FFF] to-[#17224D]',
      href: `/${locale}/admin/courses`,
    },
    {
      title: 'Active Enrollments',
      value: activeEnrollments[0].count,
      icon: UserCheck,
      color: 'from-[#17224D] to-[#007FFF]',
      href: `/${locale}/admin/enrollments`,
    },
    {
      title: 'Total Revenue',
      value: `$${Number(totalRevenue[0].total).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-[#007FFF] to-[#0066CC]',
      href: `/${locale}/admin/payments`,
    },
    {
      title: 'Pending Payments',
      value: pendingPayments[0].count,
      icon: TrendingUp,
      color: 'from-[#17224D] to-[#363942]',
      href: `/${locale}/admin/payments`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Admin Dashboard</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Manage your learning management system</Trans>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        {/* Email Verification Stats */}
        <div className="mb-8">
          <VerificationStatsWidget />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#17224D]">
              <Trans>Quick Actions</Trans>
            </h3>
            <ExportUnverifiedButton />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href={`/${locale}/admin/teachers/new`}
              className="px-6 py-4 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-xl hover:shadow-xl hover:shadow-[#007FFF]/20 transition-all font-semibold text-center"
            >
              <Trans>Add Teacher</Trans>
            </Link>
            <Link
              href={`/${locale}/admin/courses/new`}
              className="px-6 py-4 bg-gradient-to-r from-[#17224D] to-[#363942] text-white rounded-xl hover:shadow-xl transition-all font-semibold text-center"
            >
              <Trans>Add Course</Trans>
            </Link>
            <Link
              href={`/${locale}/admin/students`}
              className="px-6 py-4 bg-white text-[#363942] rounded-xl border-2 border-gray-200 hover:border-[#007FFF] transition-all font-semibold text-center"
            >
              <Trans>View Students</Trans>
            </Link>
            <Link
              href={`/${locale}/admin/payments`}
              className="px-6 py-4 bg-white text-[#363942] rounded-xl border-2 border-gray-200 hover:border-[#007FFF] transition-all font-semibold text-center"
            >
              <Trans>View Payments</Trans>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
