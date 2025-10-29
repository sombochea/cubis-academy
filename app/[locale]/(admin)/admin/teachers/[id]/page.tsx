import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, teachers, courses } from '@/lib/drizzle/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { Edit, Trash2, ArrowLeft, Mail, Phone, BookOpen, Calendar } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function TeacherViewPage({ 
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
      phone: users.phone,
      bio: teachers.bio,
      spec: teachers.spec,
      isActive: users.isActive,
      created: users.created,
      updated: users.updated,
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
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/admin/teachers`}
            className="inline-flex items-center gap-2 text-[#007FFF] hover:text-[#0066CC] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <Trans>Back to Teachers</Trans>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#007FFF] to-[#17224D] px-8 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{teacher.name}</h1>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  {teacher.spec && (
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">
                      {teacher.spec}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/${locale}/admin/teachers/${id}/edit`}
                  className="px-4 py-2 bg-white text-[#007FFF] rounded-lg hover:bg-white/90 transition-colors font-semibold flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <Trans>Edit</Trans>
                </Link>
                <Link
                  href={`/${locale}/admin/teachers/${id}/delete`}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <Trans>Delete</Trans>
                </Link>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-[#F4F5F7] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#007FFF]/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#007FFF]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#363942]/70"><Trans>Courses</Trans></p>
                    <p className="text-lg font-bold text-[#17224D]">{courseCount.count}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F4F5F7] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#007FFF]/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#007FFF]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#363942]/70"><Trans>Email</Trans></p>
                    <p className="text-sm font-medium text-[#17224D] truncate">{teacher.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F4F5F7] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#007FFF]/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#007FFF]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#363942]/70"><Trans>Status</Trans></p>
                    <p className={`text-lg font-bold ${teacher.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                      {teacher.isActive ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#17224D] mb-3"><Trans>Contact Information</Trans></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#363942]/70 mb-1"><Trans>Email</Trans></p>
                    <p className="text-[#363942]">{teacher.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#363942]/70 mb-1"><Trans>Phone</Trans></p>
                    <p className="text-[#363942]">
                      {teacher.phone || <span className="text-[#363942]/50"><Trans>Not provided</Trans></span>}
                    </p>
                  </div>
                </div>
              </div>

              {teacher.bio && (
                <div>
                  <h3 className="text-lg font-bold text-[#17224D] mb-3"><Trans>Biography</Trans></h3>
                  <p className="text-[#363942] leading-relaxed">{teacher.bio}</p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#363942]/70"><Trans>Created</Trans></p>
                    <p className="text-[#17224D] font-medium">{new Date(teacher.created).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[#363942]/70"><Trans>Last Updated</Trans></p>
                    <p className="text-[#17224D] font-medium">{new Date(teacher.updated).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
