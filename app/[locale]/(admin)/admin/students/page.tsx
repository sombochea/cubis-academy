import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, students, enrollments } from '@/lib/drizzle/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { Eye, Mail, Phone } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function StudentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  const studentsList = await db
    .select({
      userId: students.userId,
      suid: students.suid,
      name: users.name,
      email: users.email,
      phone: users.phone,
      gender: students.gender,
      enrolled: students.enrolled,
      isActive: users.isActive,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id));

  // Get enrollment counts for each student
  const enrollmentCounts = await db
    .select({
      studentId: enrollments.studentId,
      count: count(),
    })
    .from(enrollments)
    .groupBy(enrollments.studentId);

  const enrollmentMap = new Map(
    enrollmentCounts.map((e) => [e.studentId, e.count])
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>Students Overview</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>View all registered students and their enrollments</Trans>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F5F7] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Student ID</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Name</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Email</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Phone</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Gender</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Enrollments</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Status</Trans>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[#17224D]">
                    <Trans>Actions</Trans>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentsList.map((student) => (
                  <tr key={student.userId} className="hover:bg-[#F4F5F7]/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#007FFF]">
                      {student.suid}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#17224D]">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#363942]/50" />
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {student.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#363942]/50" />
                          {student.phone}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {student.gender || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[#007FFF]/10 text-[#007FFF]">
                        {enrollmentMap.get(student.userId) || 0} <Trans>courses</Trans>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        student.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {student.isActive ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/${locale}/admin/students/${student.userId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-[#007FFF] hover:bg-[#007FFF]/10 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <Trans>View</Trans>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {studentsList.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#363942]/70">
                <Trans>No students found.</Trans>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
