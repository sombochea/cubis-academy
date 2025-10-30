import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle/db";
import { payments, courses, enrollments } from "@/lib/drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { Trans } from "@lingui/react/macro";
import { StudentNav } from "@/components/student/StudentNav";
import { PaymentsDataTable } from "@/components/student/PaymentsDataTable";
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { setI18n } from "@lingui/react/server";
import { loadCatalog, i18n } from "@/lib/i18n";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PaymentsPage({
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

  // Get all payments with course and enrollment details
  const paymentsList = await db
    .select({
      id: payments.id,
      enrollmentId: payments.enrollmentId,
      courseId: courses.id,
      courseTitle: courses.title,
      amount: payments.amount,
      method: payments.method,
      status: payments.status,
      txnId: payments.txnId,
      proofUrl: payments.proofUrl,
      notes: payments.notes,
      created: payments.created,
      totalAmount: enrollments.totalAmount,
      paidAmount: enrollments.paidAmount,
    })
    .from(payments)
    .leftJoin(courses, eq(payments.courseId, courses.id))
    .leftJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
    .where(eq(payments.studentId, session.user.id))
    .orderBy(desc(payments.created));

  // Get enrollments with outstanding balances
  const overdueEnrollments = await db
    .select({
      id: enrollments.id,
      courseTitle: courses.title,
      totalAmount: enrollments.totalAmount,
      paidAmount: enrollments.paidAmount,
      enrolled: enrollments.enrolled,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(
        eq(enrollments.studentId, session.user.id),
        eq(enrollments.status, "active"),
        sql`${enrollments.totalAmount} > ${enrollments.paidAmount}`
      )
    );

  // Calculate stats
  const totalPayments = paymentsList.length;
  const completedPayments = paymentsList.filter(
    (p) => p.status === "completed"
  ).length;
  const pendingPayments = paymentsList.filter(
    (p) => p.status === "pending"
  ).length;
  const totalSpent = paymentsList
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalOutstanding = overdueEnrollments.reduce(
    (sum, e) => sum + (Number(e.totalAmount) - Number(e.paidAmount)),
    0
  );

  const stats = [
    {
      title: <Trans>Total Payments</Trans>,
      value: totalPayments,
      icon: CreditCard,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: <Trans>Completed</Trans>,
      value: completedPayments,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: <Trans>Pending</Trans>,
      value: pendingPayments,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: <Trans>Total Spent</Trans>,
      value: `$${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: <Trans>Outstanding</Trans>,
      value: `$${totalOutstanding.toFixed(2)}`,
      icon: AlertTriangle,
      color:
        totalOutstanding > 0
          ? "from-red-500 to-orange-500"
          : "from-gray-400 to-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <StudentNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#17224D] mb-2">
              <Trans>Payment History</Trans>
            </h2>
            <p className="text-[#363942]/70">
              <Trans>Track your payments and manage outstanding balances</Trans>
            </p>
          </div>
        </div>

        {/* Outstanding Balance Alert */}
        {overdueEnrollments.length > 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-orange-900 mb-2">
                  <Trans>Outstanding Balance</Trans>
                </h3>
                <p className="text-orange-800 mb-4">
                  <Trans>
                    You have {overdueEnrollments.length} course(s) with
                    outstanding balance of ${totalOutstanding.toFixed(2)}
                  </Trans>
                </p>
                <div className="space-y-2">
                  {overdueEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between bg-white rounded-lg p-3"
                    >
                      <div>
                        <p className="font-semibold text-[#17224D]">
                          {enrollment.courseTitle}
                        </p>
                        <p className="text-sm text-[#363942]/70">
                          <Trans>
                            Paid: ${Number(enrollment.paidAmount).toFixed(2)} /
                            ${Number(enrollment.totalAmount).toFixed(2)}
                          </Trans>
                        </p>
                      </div>
                      <Link
                        href={`/${locale}/student/payments/new?enrollmentId=${enrollment.id}&amount=${
                          Number(enrollment.totalAmount) -
                          Number(enrollment.paidAmount)
                        }`}
                      >
                        <Button size="sm">
                          <Trans>Pay Now</Trans>
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-[#17224D] mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-[#363942]/70 font-medium">
                  {stat.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payments DataTable */}
        <PaymentsDataTable payments={paymentsList} locale={locale} />
      </div>
    </div>
  );
}
