import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, students, enrollments, courses } from '@/lib/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function StudentEnrollmentsPage({ 
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

  // Get student info
  const [student] = await db
    .select({
      userId: students.userId,
      suid: students.suid,
      name: users.name,
      photo: students.photo,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(students.userId, id));

  if (!student) {
    notFound();
  }

  // Get student enrollments with course details
  const studentEnrollments = await db
    .select({
      enrollmentId: enrollments.id,
      courseId: courses.id,
      courseTitle: courses.title,
      courseDesc: courses.desc,
      courseLevel: courses.level,
      coursePrice: courses.price,
      enrolledAt: enrollments.enrolled,
      status: enrollments.status,
      progress: enrollments.progress,
      completed: enrollments.completed,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, id))
    .orderBy(desc(enrollments.enrolled));

  const totalEnrollments = studentEnrollments.length;
  const activeEnrollments = studentEnrollments.filter(e => e.status === 'active').length;
  const completedEnrollments = studentEnrollments.filter(e => e.status === 'completed').length;
  const totalAmount = studentEnrollments.reduce((sum, e) => sum + Number(e.coursePrice || 0), 0);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/admin/students/${id}`}
            className="inline-flex items-center gap-2 text-[#007FFF] hover:text-[#0066CC] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <Trans>Back to Student</Trans>
          </Link>
        </div>

        {/* Student Header */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#F4F5F7] flex-shrink-0">
              {student.photo ? (
                <Image
                  src={student.photo}
                  alt={student.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#007FFF] to-[#17224D] text-white font-bold text-xl">
                  {student.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#17224D]">{student.name}</h1>
              <p className="text-sm text-[#363942]/70 font-mono">{student.suid}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#007FFF]/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#007FFF]" />
              </div>
              <div>
                <p className="text-sm text-[#363942]/70"><Trans>Total Enrollments</Trans></p>
                <p className="text-2xl font-bold text-[#17224D]">{totalEnrollments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#363942]/70"><Trans>Active</Trans></p>
                <p className="text-2xl font-bold text-green-600">{activeEnrollments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[#363942]/70"><Trans>Completed</Trans></p>
                <p className="text-2xl font-bold text-blue-600">{completedEnrollments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-[#363942]/70"><Trans>Total Amount</Trans></p>
                <p className="text-2xl font-bold text-purple-600">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollments List */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#17224D]">
              <Trans>Course Enrollments</Trans>
            </h2>
          </div>

          {studentEnrollments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {studentEnrollments.map((enrollment) => (
                <div key={enrollment.enrollmentId} className="p-6 hover:bg-[#F4F5F7]/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-[#17224D] mb-1">
                                {enrollment.courseTitle}
                              </h3>
                              <div className="flex items-center gap-3 text-sm">
                                {enrollment.courseLevel && (
                                  <span className="px-2 py-1 bg-gray-100 text-[#363942] rounded text-xs font-medium capitalize">
                                    {enrollment.courseLevel}
                                  </span>
                                )}
                                <span className="px-2 py-1 bg-[#007FFF]/10 text-[#007FFF] rounded text-xs font-semibold">
                                  <Trans>Progress</Trans>: {enrollment.progress}%
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#17224D]">
                                ${Number(enrollment.coursePrice || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-sm text-[#363942]/70">
                              <Calendar className="w-4 h-4" />
                              <span>
                                <Trans>Enrolled</Trans>: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {enrollment.status === 'active' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                  <Clock className="w-3 h-3" />
                                  <Trans>Active</Trans>
                                </span>
                              )}
                              {enrollment.status === 'completed' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                  <CheckCircle className="w-3 h-3" />
                                  <Trans>Completed</Trans>
                                </span>
                              )}
                              {enrollment.status === 'dropped' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                  <XCircle className="w-3 h-3" />
                                  <Trans>Dropped</Trans>
                                </span>
                              )}
                            </div>

                            {enrollment.completed && (
                              <div className="flex items-center gap-2 text-sm text-[#363942]/70">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span>
                                  <Trans>Completed</Trans>: {new Date(enrollment.completed).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/admin/courses/${enrollment.courseId}`}
                      className="px-4 py-2 text-[#007FFF] hover:bg-[#007FFF]/10 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      <Trans>View Course</Trans>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#F4F5F7] rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-[#363942]/40" />
              </div>
              <p className="text-lg font-medium text-[#363942]/70 mb-2">
                <Trans>No enrollments yet</Trans>
              </p>
              <p className="text-sm text-[#363942]/50">
                <Trans>This student hasn't enrolled in any courses</Trans>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
