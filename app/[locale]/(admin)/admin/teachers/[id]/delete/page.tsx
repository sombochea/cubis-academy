import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, teachers, courses } from '@/lib/drizzle/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { DeleteTeacherForm } from '@/components/admin/DeleteTeacherForm';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function DeleteTeacherPage({ 
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

  const [teacher] = await db
    .select({
      userId: teachers.userId,
      name: users.name,
      email: users.email,
      spec: teachers.spec,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(eq(teachers.userId, id));

  if (!teacher) {
    notFound();
  }

  const [courseCount] = await db
    .select({ count: count() })
    .from(courses)
    .where(eq(courses.teacherId, id));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/admin/teachers/${id}`}
            className="inline-flex items-center gap-2 text-[#007FFF] hover:text-[#0066CC] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <Trans>Back to Teacher</Trans>
          </Link>
        </div>

        <div className="bg-white rounded-xl border-2 border-red-200 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-900">
                  <Trans>Delete Teacher</Trans>
                </h2>
                <p className="text-sm text-red-700">
                  <Trans>This action cannot be undone</Trans>
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#17224D] mb-2">
                <Trans>Teacher Details</Trans>
              </h3>
              <div className="bg-[#F4F5F7] rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm text-[#363942]/70"><Trans>Name:</Trans> </span>
                  <span className="text-sm font-semibold text-[#17224D]">{teacher.name}</span>
                </div>
                <div>
                  <span className="text-sm text-[#363942]/70"><Trans>Email:</Trans> </span>
                  <span className="text-sm font-semibold text-[#17224D]">{teacher.email}</span>
                </div>
                {teacher.spec && (
                  <div>
                    <span className="text-sm text-[#363942]/70"><Trans>Specialization:</Trans> </span>
                    <span className="text-sm font-semibold text-[#17224D]">{teacher.spec}</span>
                  </div>
                )}
              </div>
            </div>

            {courseCount.count > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <Trans>Warning: This teacher has {courseCount.count} assigned course(s). Deleting will unassign them from all courses.</Trans>
                </p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-[#363942] mb-4">
                <Trans>Are you sure you want to delete this teacher? This will permanently remove:</Trans>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#363942] ml-4">
                <li><Trans>Teacher profile and information</Trans></li>
                <li><Trans>Course assignments</Trans></li>
                <li><Trans>Access to the system</Trans></li>
              </ul>
            </div>

            <DeleteTeacherForm teacherId={id} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
