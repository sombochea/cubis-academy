import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, users, teachers } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  const coursesList = await db
    .select({
      id: courses.id,
      title: courses.title,
      category: courses.category,
      price: courses.price,
      duration: courses.duration,
      level: courses.level,
      isActive: courses.isActive,
      teacherName: users.name,
    })
    .from(courses)
    .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
    .leftJoin(users, eq(teachers.userId, users.id));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#17224D] mb-2">
              <Trans>Courses Management</Trans>
            </h2>
            <p className="text-[#363942]/70">
              <Trans>Manage course catalog and assignments</Trans>
            </p>
          </div>
          <Link
            href={`/${locale}/admin/courses/new`}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-xl hover:shadow-xl transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            <Trans>Add Course</Trans>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F5F7] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Title</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Category</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Teacher</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Price</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Duration</Trans>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#17224D]">
                    <Trans>Level</Trans>
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
                {coursesList.map((course) => (
                  <tr key={course.id} className="hover:bg-[#F4F5F7]/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#17224D]">
                      {course.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {course.category || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {course.teacherName || <span className="text-[#363942]/50"><Trans>Unassigned</Trans></span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      ${Number(course.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#363942]">
                      {course.duration}h
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        course.level === 'beginner' 
                          ? 'bg-green-100 text-green-700'
                          : course.level === 'intermediate'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <Trans>{course.level}</Trans>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        course.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {course.isActive ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/admin/courses/${course.id}`}
                          className="p-2 text-[#007FFF] hover:bg-[#007FFF]/10 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/${locale}/admin/courses/${course.id}/edit`}
                          className="p-2 text-[#007FFF] hover:bg-[#007FFF]/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/${locale}/admin/courses/${course.id}/delete`}
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
          
          {coursesList.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#363942]/70">
                <Trans>No courses found. Add your first course to get started.</Trans>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
