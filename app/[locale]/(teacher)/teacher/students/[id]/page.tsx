import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import {
  courses,
  enrollments,
  users,
  students,
  scores,
  attendances,
  payments,
} from '@/lib/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { Trans } from '@lingui/react/macro';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  BookOpen,
  TrendingUp,
  Award,
  CheckCircle2,
  DollarSign,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { getAvatarGradient, getInitials } from '@/lib/avatar-utils';

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  const session = await auth();

  if (!session?.user || session.user.role !== 'teacher') {
    redirect(`/${locale}/login`);
  }

  // Get student information
  const [student] = await db
    .select({
      id: students.userId,
      name: users.name,
      email: users.email,
      phone: users.phone,
      photo: students.photo,
      dob: students.dob,
      gender: students.gender,
      address: students.address,
      enrolled: students.enrolled,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(students.userId, id));

  if (!student) {
    redirect(`/${locale}/teacher/students`);
  }

  // Get all enrollments for this student in teacher's courses
  const studentEnrollments = await db
    .select({
      enrollmentId: enrollments.id,
      courseId: courses.id,
      courseTitle: courses.title,
      courseCategory: courses.category,
      courseLevel: courses.level,
      progress: enrollments.progress,
      status: enrollments.status,
      enrolled: enrollments.enrolled,
      completed: enrollments.completed,
      totalAmount: enrollments.totalAmount,
      paidAmount: enrollments.paidAmount,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(
        eq(enrollments.studentId, id),
        eq(courses.teacherId, session.user.id)
      )
    )
    .orderBy(enrollments.enrolled);

  // If student has no enrollments in teacher's courses, redirect
  if (studentEnrollments.length === 0) {
    redirect(`/${locale}/teacher/students`);
  }

  // Get scores for all enrollments
  const studentScores = await db
    .select({
      enrollmentId: scores.enrollmentId,
      title: scores.title,
      score: scores.score,
      maxScore: scores.maxScore,
      created: scores.created,
    })
    .from(scores)
    .where(
      sql`${scores.enrollmentId} IN ${sql.raw(
        `(${studentEnrollments.map((e) => `'${e.enrollmentId}'`).join(',')})`
      )}`
    )
    .orderBy(scores.created);

  // Get attendance records
  const studentAttendance = await db
    .select({
      enrollmentId: attendances.enrollmentId,
      date: attendances.date,
      status: attendances.status,
    })
    .from(attendances)
    .where(
      sql`${attendances.enrollmentId} IN ${sql.raw(
        `(${studentEnrollments.map((e) => `'${e.enrollmentId}'`).join(',')})`
      )}`
    )
    .orderBy(attendances.date);

  // Get payment records
  const studentPayments = await db
    .select({
      enrollmentId: payments.enrollmentId,
      amount: payments.amount,
      status: payments.status,
      created: payments.created,
    })
    .from(payments)
    .where(
      sql`${payments.enrollmentId} IN ${sql.raw(
        `(${studentEnrollments.map((e) => `'${e.enrollmentId}'`).join(',')})`
      )}`
    )
    .orderBy(payments.created);

  // Calculate statistics
  const totalCourses = studentEnrollments.length;
  const completedCourses = studentEnrollments.filter(
    (e) => e.status === 'completed'
  ).length;
  const avgProgress = Math.round(
    studentEnrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses
  );

  // Calculate average score
  const avgScore =
    studentScores.length > 0
      ? Math.round(
          studentScores.reduce(
            (sum, s) => sum + (s.score / s.maxScore) * 100,
            0
          ) / studentScores.length
        )
      : 0;

  // Calculate attendance rate
  const totalAttendance = studentAttendance.length;
  const presentCount = studentAttendance.filter(
    (a) => a.status === 'present'
  ).length;
  const attendanceRate =
    totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // Calculate total paid
  const totalPaid = studentPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  // Group data by enrollment
  const enrollmentData = studentEnrollments.map((enrollment) => {
    const enrollmentScores = studentScores.filter(
      (s) => s.enrollmentId === enrollment.enrollmentId
    );
    const enrollmentAttendance = studentAttendance.filter(
      (a) => a.enrollmentId === enrollment.enrollmentId
    );
    const enrollmentPayments = studentPayments.filter(
      (p) => p.enrollmentId === enrollment.enrollmentId
    );

    const avgEnrollmentScore =
      enrollmentScores.length > 0
        ? Math.round(
            enrollmentScores.reduce(
              (sum, s) => sum + (s.score / s.maxScore) * 100,
              0
            ) / enrollmentScores.length
          )
        : 0;

    const enrollmentAttendanceRate =
      enrollmentAttendance.length > 0
        ? Math.round(
            (enrollmentAttendance.filter((a) => a.status === 'present').length /
              enrollmentAttendance.length) *
              100
          )
        : 0;

    return {
      ...enrollment,
      scores: enrollmentScores,
      avgScore: avgEnrollmentScore,
      attendance: enrollmentAttendance,
      attendanceRate: enrollmentAttendanceRate,
      payments: enrollmentPayments,
    };
  });

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={`/${locale}/teacher/students`}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            <Trans>Back to Students</Trans>
          </Button>
        </Link>

        {/* Student Profile Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          {/* Gradient Bar */}
          <div className="h-2 bg-gradient-to-r from-[#007FFF] via-[#17224D] to-[#007FFF]"></div>

          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24 border-4 border-gray-100">
                <AvatarImage src={student.photo || undefined} />
                <AvatarFallback
                  className={`bg-gradient-to-br ${getAvatarGradient(
                    student.id
                  )} text-white text-2xl font-bold`}
                >
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#17224D] mb-2">
                  {student.name}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#363942]/70">
                  {student.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#007FFF]" />
                      {student.email}
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#007FFF]" />
                      {student.phone}
                    </div>
                  )}
                  {student.dob && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#007FFF]" />
                      <Trans>Born:</Trans> {formatDate(student.dob, locale)}
                    </div>
                  )}
                  {student.gender && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#007FFF]" />
                      {student.gender.charAt(0).toUpperCase() +
                        student.gender.slice(1)}
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-[#007FFF]" />
                      {student.address}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#007FFF]" />
                    <Trans>Enrolled:</Trans>{' '}
                    {formatDate(student.enrolled, locale)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Total Courses */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {totalCourses}
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Total Courses</Trans>
                </div>
              </div>
            </div>
          </div>

          {/* Completed Courses */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {completedCourses}
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Completed</Trans>
                </div>
              </div>
            </div>
          </div>

          {/* Average Progress */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {avgProgress}%
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Avg Progress</Trans>
                </div>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {avgScore}%
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Avg Score</Trans>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {attendanceRate}%
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Attendance</Trans>
                </div>
              </div>
            </div>
          </div>

          {/* Total Paid */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  ${totalPaid.toFixed(2)}
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Total Paid</Trans>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Enrollments */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#17224D]">
              <Trans>Course Performance</Trans>
            </h2>
            <p className="text-sm text-[#363942]/70 mt-1">
              <Trans>Detailed performance for each enrolled course</Trans>
            </p>
          </div>

          <div className="p-6 space-y-4">
            {enrollmentData.map((enrollment) => (
              <div
                key={enrollment.enrollmentId}
                className="border border-gray-200 rounded-lg p-5 hover:border-[#007FFF]/30 transition-colors"
              >
                {/* Course Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#17224D] mb-1">
                      {enrollment.courseTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold">
                        {enrollment.courseCategory}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          enrollment.courseLevel === 'beginner'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : enrollment.courseLevel === 'intermediate'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        }`}
                      >
                        {enrollment.courseLevel}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          enrollment.status === 'active'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : enrollment.status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {/* Progress */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-[#363942]/70 mb-1">
                      <Trans>Progress</Trans>
                    </div>
                    <div className="text-xl font-bold text-[#007FFF]">
                      {enrollment.progress}%
                    </div>
                  </div>

                  {/* Average Score */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-[#363942]/70 mb-1">
                      <Trans>Avg Score</Trans>
                    </div>
                    <div className="text-xl font-bold text-[#007FFF]">
                      {enrollment.avgScore}%
                    </div>
                  </div>

                  {/* Attendance */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-[#363942]/70 mb-1">
                      <Trans>Attendance</Trans>
                    </div>
                    <div className="text-xl font-bold text-[#007FFF]">
                      {enrollment.attendanceRate}%
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-[#363942]/70 mb-1">
                      <Trans>Paid</Trans>
                    </div>
                    <div className="text-xl font-bold text-[#007FFF]">
                      {Math.round(
                        (parseFloat(enrollment.paidAmount) /
                          parseFloat(enrollment.totalAmount)) *
                          100
                      )}
                      %
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#363942]/70">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <Trans>Enrolled:</Trans>{' '}
                    {formatDate(enrollment.enrolled, locale)}
                  </div>
                  {enrollment.completed && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <Trans>Completed:</Trans>{' '}
                      {formatDate(enrollment.completed, locale)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
