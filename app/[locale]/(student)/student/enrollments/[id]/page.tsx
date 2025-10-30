import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { enrollments, courses, scores, attendances, payments, courseFeedback } from '@/lib/drizzle/schema';
import { eq, and, desc, sum } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { StudentNav } from '@/components/student/StudentNav';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Award, 
  TrendingUp,
  Play,
  Video,
  FileText,
  CheckCircle,
  Clock,
  Target,
  DollarSign,
  MapPin,
  Monitor,
  Users,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { CourseFeedbackForm } from '@/components/student/CourseFeedbackForm';
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
  
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Get enrollment with course details
  const enrollmentResult = await db
    .select({
      id: enrollments.id,
      courseId: courses.id,
      courseTitle: courses.title,
      courseDesc: courses.desc,
      courseCategory: courses.category,
      courseLevel: courses.level,
      coursePrice: courses.price,
      courseDuration: courses.duration,
      deliveryMode: courses.deliveryMode,
      location: courses.location,
      youtubeUrl: courses.youtubeUrl,
      zoomUrl: courses.zoomUrl,
      status: enrollments.status,
      progress: enrollments.progress,
      totalAmount: enrollments.totalAmount,
      paidAmount: enrollments.paidAmount,
      enrolled: enrollments.enrolled,
      completed: enrollments.completed,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(
        eq(enrollments.id, id),
        eq(enrollments.studentId, session.user.id)
      )
    );

  const enrollment = enrollmentResult[0];

  if (!enrollment) {
    notFound();
  }

  // Get scores
  const scoresList = await db
    .select({
      id: scores.id,
      title: scores.title,
      score: scores.score,
      maxScore: scores.maxScore,
      remarks: scores.remarks,
      created: scores.created,
    })
    .from(scores)
    .where(eq(scores.enrollmentId, id))
    .orderBy(desc(scores.created));

  // Get attendance
  const attendanceList = await db
    .select({
      id: attendances.id,
      date: attendances.date,
      status: attendances.status,
      notes: attendances.notes,
    })
    .from(attendances)
    .where(eq(attendances.enrollmentId, id))
    .orderBy(desc(attendances.date));

  // Get payments for this enrollment
  const paymentsList = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      method: payments.method,
      status: payments.status,
      txnId: payments.txnId,
      proofUrl: payments.proofUrl,
      notes: payments.notes,
      created: payments.created,
    })
    .from(payments)
    .where(eq(payments.enrollmentId, id))
    .orderBy(desc(payments.created));

  // Get existing feedback
  const [existingFeedback] = await db
    .select({
      id: courseFeedback.id,
      rating: courseFeedback.rating,
      comment: courseFeedback.comment,
      isAnonymous: courseFeedback.isAnonymous,
    })
    .from(courseFeedback)
    .where(eq(courseFeedback.enrollmentId, id));

  // Calculate stats
  const totalAttendance = attendanceList.length;
  const presentCount = attendanceList.filter(a => a.status === 'present').length;
  const attendanceRate = totalAttendance > 0 
    ? Math.round((presentCount / totalAttendance) * 100) 
    : 0;

  const avgScore = scoresList.length > 0
    ? Math.round(
        scoresList.reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / scoresList.length
      )
    : 0;

  // Payment stats
  const totalAmount = Number(enrollment.totalAmount);
  const paidAmount = Number(enrollment.paidAmount);
  const remainingAmount = totalAmount - paidAmount;
  const paymentProgress = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  const levelConfig = {
    beginner: { label: <Trans>Beginner</Trans>, color: 'from-green-500 to-emerald-500' },
    intermediate: { label: <Trans>Intermediate</Trans>, color: 'from-yellow-500 to-orange-500' },
    advanced: { label: <Trans>Advanced</Trans>, color: 'from-red-500 to-pink-500' },
  };

  const level = levelConfig[enrollment.courseLevel];

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <StudentNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={`/${locale}/student/enrollments`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <Trans>Back to My Courses</Trans>
          </Button>
        </Link>

        {/* Course Header */}
        <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#17224D] mb-2">
                    {enrollment.courseTitle}
                  </h1>
                  {enrollment.courseDesc && (
                    <p className="text-[#363942]/70 mb-4">
                      {enrollment.courseDesc}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {enrollment.courseCategory && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                        <FileText className="w-4 h-4" />
                        <span className="capitalize">{enrollment.courseCategory}</span>
                      </span>
                    )}
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${level.color} text-white`}>
                      {level.label}
                    </span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      enrollment.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : enrollment.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Trans>{enrollment.status}</Trans>
                    </span>
                  </div>

                  {/* Delivery Mode & Location */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#363942]">
                    <div className="flex items-center gap-1.5">
                      {enrollment.deliveryMode === 'online' ? (
                        <Monitor className="w-4 h-4" />
                      ) : enrollment.deliveryMode === 'face_to_face' ? (
                        <Users className="w-4 h-4" />
                      ) : (
                        <Monitor className="w-4 h-4" />
                      )}
                      <span className="capitalize">
                        {enrollment.deliveryMode === 'face_to_face' ? (
                          <Trans>Face-to-Face</Trans>
                        ) : enrollment.deliveryMode === 'hybrid' ? (
                          <Trans>Hybrid</Trans>
                        ) : (
                          <Trans>Online</Trans>
                        )}
                      </span>
                    </div>
                    {enrollment.location && (enrollment.deliveryMode === 'face_to_face' || enrollment.deliveryMode === 'hybrid') && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{enrollment.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                {enrollment.youtubeUrl && (
                  <a
                    href={enrollment.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2 bg-red-600 hover:bg-red-700">
                      <Play className="w-4 h-4" />
                      <Trans>Watch on YouTube</Trans>
                    </Button>
                  </a>
                )}
                {enrollment.zoomUrl && (
                  <a
                    href={enrollment.zoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Video className="w-4 h-4" />
                      <Trans>Join Zoom Class</Trans>
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#17224D] mb-1">{enrollment.progress}%</div>
            <div className="text-xs text-[#363942]/70 font-medium">
              <Trans>Progress</Trans>
            </div>
            <Progress value={enrollment.progress} className="h-1.5 mt-2" />
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#17224D] mb-1">{avgScore}%</div>
            <div className="text-xs text-[#363942]/70 font-medium">
              <Trans>Avg Score</Trans>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#17224D] mb-1">{attendanceRate}%</div>
            <div className="text-xs text-[#363942]/70 font-medium">
              <Trans>Attendance</Trans>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#17224D] mb-1">{totalAttendance}</div>
            <div className="text-xs text-[#363942]/70 font-medium">
              <Trans>Classes</Trans>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#17224D] mb-1">{paymentProgress}%</div>
            <div className="text-xs text-[#363942]/70 font-medium">
              <Trans>Paid</Trans>
            </div>
            <Progress value={paymentProgress} className="h-1.5 mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scores */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#17224D] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              <Trans>Scores</Trans>
            </h3>
            {scoresList.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-[#363942]/20 mx-auto mb-3" />
                <p className="text-[#363942]/70">
                  <Trans>No scores recorded yet</Trans>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {scoresList.map((score) => (
                  <div key={score.id} className="p-4 bg-[#F4F5F7] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#17224D] mb-1">{score.title}</p>
                        <span className="text-sm text-[#363942]/70">
                          {new Date(score.created).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-[#007FFF]">
                        {score.score}/{score.maxScore}
                      </span>
                    </div>
                    {score.remarks && (
                      <p className="text-sm text-[#363942] mt-2">{score.remarks}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#17224D] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <Trans>Attendance</Trans>
            </h3>
            {attendanceList.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-[#363942]/20 mx-auto mb-3" />
                <p className="text-[#363942]/70">
                  <Trans>No attendance records yet</Trans>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceList.map((attendance) => (
                  <div key={attendance.id} className="p-4 bg-[#F4F5F7] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#363942]/70">
                        {new Date(attendance.date).toLocaleDateString()}
                      </span>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        attendance.status === 'present'
                          ? 'bg-green-100 text-green-700'
                          : attendance.status === 'absent'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <Trans>{attendance.status}</Trans>
                      </span>
                    </div>
                    {attendance.notes && (
                      <p className="text-sm text-[#363942]">{attendance.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[#17224D] flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              <Trans>Payment History</Trans>
            </h3>
            <Link href={`/${locale}/student/payments/new?enrollmentId=${id}&amount=${remainingAmount}&courseName=${enrollment.courseTitle}`}>
              <Button size="sm">
                <Trans>Make Payment</Trans>
              </Button>
            </Link>
          </div>

          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-[#F4F5F7] rounded-lg">
            <div>
              <p className="text-sm text-[#363942]/70 mb-1"><Trans>Total Amount</Trans></p>
              <p className="text-xl font-bold text-[#17224D]">${totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-[#363942]/70 mb-1"><Trans>Paid Amount</Trans></p>
              <p className="text-xl font-bold text-green-600">${paidAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-[#363942]/70 mb-1"><Trans>Remaining</Trans></p>
              <p className="text-xl font-bold text-orange-600">${remainingAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Payment List */}
          {paymentsList.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-[#363942]/20 mx-auto mb-3" />
              <p className="text-[#363942]/70 mb-4">
                <Trans>No payments recorded yet</Trans>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentsList.map((payment) => (
                <div key={payment.id} className="p-4 bg-[#F4F5F7] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#17224D]">${Number(payment.amount).toFixed(2)}</p>
                      <span className="text-sm text-[#363942]/70">
                        {new Date(payment.created).toLocaleDateString()} • {payment.method}
                      </span>
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : payment.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Trans>{payment.status}</Trans>
                    </span>
                  </div>
                  {payment.txnId && (
                    <p className="text-xs text-[#363942]/70 font-mono">TXN: {payment.txnId}</p>
                  )}
                  {payment.notes && (
                    <p className="text-sm text-[#363942] mt-2">{payment.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-[#17224D] mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <Trans>Course Feedback</Trans>
          </h3>
          <CourseFeedbackForm
            enrollmentId={id}
            courseId={enrollment.courseId}
            existingFeedback={existingFeedback}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
