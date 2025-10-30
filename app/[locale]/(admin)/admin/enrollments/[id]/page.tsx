import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { enrollments, students, courses, users, scores, attendances } from '@/lib/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, BookOpen, Calendar, TrendingUp, Award, CheckCircle2 } from 'lucide-react';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function EnrollmentDetailsPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { locale, id } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  // Get enrollment details
  const [enrollment] = await db
    .select({
      id: enrollments.id,
      studentId: students.userId,
      studentName: users.name,
      studentEmail: users.email,
      studentSuid: students.suid,
      studentPhoto: students.photo,
      courseId: courses.id,
      courseTitle: courses.title,
      courseCategory: courses.category,
      courseLevel: courses.level,
      status: enrollments.status,
      progress: enrollments.progress,
      enrolled: enrollments.enrolled,
      completed: enrollments.completed,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.id, id));

  if (!enrollment) {
    redirect(`/${locale}/admin/enrollments`);
  }

  // Get scores for this enrollment
  const enrollmentScores = await db
    .select()
    .from(scores)
    .where(eq(scores.enrollmentId, id))
    .orderBy(desc(scores.created));

  // Get attendance records
  const attendanceRecords = await db
    .select()
    .from(attendances)
    .where(eq(attendances.enrollmentId, id))
    .orderBy(desc(attendances.date));

  // Calculate attendance stats
  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
  const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  // Calculate average score
  const avgScore = enrollmentScores.length > 0
    ? Math.round(enrollmentScores.reduce((sum, s) => sum + Number(s.score), 0) / enrollmentScores.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/${locale}/admin/enrollments`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <Trans>Back to Enrollments</Trans>
            </Button>
          </Link>
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Enrollment Details</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>View enrollment information and progress</Trans>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student & Course Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-[#17224D] mb-4">
                <Trans>Enrollment Information</Trans>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-[#363942]/70 mb-2">
                    <User className="w-4 h-4" />
                    <Trans>Student</Trans>
                  </div>
                  <Link 
                    href={`/${locale}/admin/students/${enrollment.studentId}`}
                    className="text-[#007FFF] hover:underline font-medium"
                  >
                    {enrollment.studentName}
                  </Link>
                  <p className="text-sm text-[#363942]/70 font-mono">{enrollment.studentSuid}</p>
                  <p className="text-sm text-[#363942]/70">{enrollment.studentEmail}</p>
                </div>

                {/* Course */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-[#363942]/70 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <Trans>Course</Trans>
                  </div>
                  <Link 
                    href={`/${locale}/admin/courses/${enrollment.courseId}`}
                    className="text-[#007FFF] hover:underline font-medium"
                  >
                    {enrollment.courseTitle}
                  </Link>
                  <p className="text-sm text-[#363942]/70">{enrollment.courseCategory}</p>
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mt-1">
                    {enrollment.courseLevel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                {/* Dates */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-[#363942]/70 mb-2">
                    <Calendar className="w-4 h-4" />
                    <Trans>Enrolled Date</Trans>
                  </div>
                  <p className="font-medium text-[#17224D]">
                    {new Date(enrollment.enrolled).toLocaleDateString()}
                  </p>
                </div>

                {enrollment.completed && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-[#363942]/70 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <Trans>Completed Date</Trans>
                    </div>
                    <p className="font-medium text-[#17224D]">
                      {new Date(enrollment.completed).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Scores */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-[#17224D] mb-4">
                <Trans>Scores History</Trans>
              </h3>
              
              {enrollmentScores.length > 0 ? (
                <div className="space-y-3">
                  {enrollmentScores.map((score) => (
                    <div key={score.id} className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg">
                      <div>
                        <p className="font-medium text-[#17224D]">{score.title}</p>
                        <p className="text-sm text-[#363942]/70">
                          {new Date(score.created).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#007FFF]">{score.score}</p>
                        <p className="text-xs text-[#363942]/70">
                          <Trans>out of</Trans> {score.maxScore}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#363942]/70 py-8">
                  <Trans>No scores recorded yet</Trans>
                </p>
              )}
            </div>

            {/* Attendance */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-[#17224D] mb-4">
                <Trans>Attendance Records</Trans>
              </h3>
              
              {attendanceRecords.length > 0 ? (
                <div className="space-y-2">
                  {attendanceRecords.slice(0, 10).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg">
                      <p className="text-sm text-[#363942]">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'present'
                          ? 'bg-green-100 text-green-700'
                          : record.status === 'absent'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <Trans>{record.status}</Trans>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#363942]/70 py-8">
                  <Trans>No attendance records yet</Trans>
                </p>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#363942]/70 mb-3">
                <Trans>Status</Trans>
              </h3>
              <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                enrollment.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : enrollment.status === 'completed'
                  ? 'bg-blue-100 text-blue-700'
                  : enrollment.status === 'dropped'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                <Trans>{enrollment.status}</Trans>
              </span>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-[#007FFF]" />
                <h3 className="text-sm font-semibold text-[#363942]/70">
                  <Trans>Course Progress</Trans>
                </h3>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-[#007FFF] mb-2">{enrollment.progress}%</p>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#007FFF] to-[#17224D]"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-[#007FFF]" />
                <h3 className="text-sm font-semibold text-[#363942]/70">
                  <Trans>Average Score</Trans>
                </h3>
              </div>
              <p className="text-4xl font-bold text-[#007FFF] text-center">
                {avgScore}
                <span className="text-lg text-[#363942]/70">/100</span>
              </p>
            </div>

            {/* Attendance Rate */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-[#007FFF]" />
                <h3 className="text-sm font-semibold text-[#363942]/70">
                  <Trans>Attendance Rate</Trans>
                </h3>
              </div>
              <p className="text-4xl font-bold text-[#007FFF] text-center mb-2">
                {attendanceRate}%
              </p>
              <p className="text-sm text-[#363942]/70 text-center">
                {presentCount} <Trans>of</Trans> {totalClasses} <Trans>classes</Trans>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
