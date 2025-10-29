import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { enrollments, students, courses, users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function EnrollmentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  const enrollmentsList = await db
    .select({
      id: enrollments.id,
      studentName: users.name,
      studentSuid: students.suid,
      courseTitle: courses.title,
      status: enrollments.status,
      progress: enrollments.progress,
      enrolled: enrollments.enrolled,
      completed: enrollments.completed,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Enrollments Overview</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>View all student course enrollments</Trans>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F5F7] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Student</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Student ID</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Course</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Status</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Progress</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Enrolled Date</Trans>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enrollmentsList.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-[#F4F5F7]/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#17224D]">
                      {enrollment.studentName}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-[#007FFF]">
                      {enrollment.studentSuid}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {enrollment.courseTitle}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        enrollment.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : enrollment.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <Trans>{enrollment.status}</Trans>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#007FFF] to-[#17224D]"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{enrollment.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {new Date(enrollment.enrolled).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {enrollmentsList.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#363942]/70">
                <Trans>No enrollments found.</Trans>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
