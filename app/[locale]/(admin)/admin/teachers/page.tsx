import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, teachers } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function TeachersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  const teachersList = await db
    .select({
      userId: teachers.userId,
      name: users.name,
      email: users.email,
      phone: users.phone,
      bio: teachers.bio,
      spec: teachers.spec,
      isActive: users.isActive,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#17224D] mb-2">
              <Trans>Teachers Management</Trans>
            </h2>
            <p className="text-[#363942]/70">
              <Trans>Manage teachers and assign courses</Trans>
            </p>
          </div>
          <Link
            href={`/${locale}/admin/teachers/new`}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-xl hover:shadow-xl transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            <Trans>Add Teacher</Trans>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F5F7] border-b border-gray-200">
                <tr>
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
                    <Trans>Specialization</Trans>
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
                {teachersList.map((teacher) => (
                  <tr key={teacher.userId} className="hover:bg-[#F4F5F7]/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#17224D]">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {teacher.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {teacher.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {teacher.spec || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        teacher.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {teacher.isActive ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/admin/teachers/${teacher.userId}/courses`}
                          className="p-2 text-[#007FFF] hover:bg-[#007FFF]/10 rounded-lg transition-colors"
                          title="Assign Courses"
                        >
                          <BookOpen className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/${locale}/admin/teachers/${teacher.userId}/edit`}
                          className="p-2 text-[#007FFF] hover:bg-[#007FFF]/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/${locale}/admin/teachers/${teacher.userId}/delete`}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {teachersList.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#363942]/70">
                <Trans>No teachers found. Add your first teacher to get started.</Trans>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
