import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, users, teachers, enrollments } from '@/lib/drizzle/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { Edit, Trash2, ArrowLeft, Users, Clock, DollarSign, Video, Calendar } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function CourseViewPage({ 
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

  const [course] = await db
    .select({
      id: courses.id,
      title: courses.title,
      desc: courses.desc,
      category: courses.category,
      price: courses.price,
      duration: courses.duration,
      level: courses.level,
      isActive: courses.isActive,
      youtubeUrl: courses.youtubeUrl,
      zoomUrl: courses.zoomUrl,
      teacherId: courses.teacherId,
      teacherName: users.name,
      created: courses.created,
      updated: courses.updated,
    })
    .from(courses)
    .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(eq(courses.id, id));

  if (!course) {
    notFound();
  }

  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(enrollments)
    .where(eq(enrollments.courseId, id));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/admin/courses`}
            className="inline-flex items-center gap-2 text-[#007FFF] hover:text-[#0066CC] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <Trans>Back to Courses</Trans>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#007FFF] to-[#17224D] px-8 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    course.level === 'beginner' 
                      ? 'bg-green-500/20 text-green-100'
                      : course.level === 'intermediate'
                      ? 'bg-yellow-500/20 text-yellow-100'
                      : 'bg-red-500/20 text-red-100'
                  }`}>
                    <Trans>{course.level}</Trans>
                  </span>
                  {course.category && (
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">
                      {course.category}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/${locale}/admin/courses/${id}/edit`}
                  className="px-4 py-2 bg-white text-[#007FFF] rounded-lg hover:bg-white/90 transition-colors font-semibold flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <Trans>Edit</Trans>
                </Link>
                <Link
                  href={`/${locale}/admin/courses/${id}/delete`}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-[#F4F5F7] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#007FFF]/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#007FFF]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#363942]/70"><Trans>Price</Trans></p>
                    <p className="text-lg font-bold text-[#17224D]">${Number(course.price).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F4F5F7] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#007FFF]/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#007FFF]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#363942]/70"><Trans>Duration</Trans></p>
                    <p className="text-lg font-bold text-[#17224D]">{course.duration}h</p>
                  </div>
                </div>
              </div>

              <Link href={`/${locale}/admin/courses/${id}/enrollments`} className="p-4 bg-[#F4F5F7] rounded-lg hover:bg-[#007FFF]/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#007FFF]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#007FFF]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#363942]/70"><Trans>Enrollments</Trans></p>
                    <p className="text-lg font-bold text-[#17224D]">{enrollmentCount.count}</p>
                  </div>
                </div>
              </Link>

              <div className="p-4 bg-[#F4F5F7] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#007FFF]/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#007FFF]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#363942]/70"><Trans>Status</Trans></p>
                    <p className={`text-lg font-bold ${course.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                      {course.isActive ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#17224D] mb-3"><Trans>Description</Trans></h3>
                <p className="text-[#363942] leading-relaxed">
                  {course.desc || <span className="text-[#363942]/50"><Trans>No description provided</Trans></span>}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#17224D] mb-3"><Trans>Teacher</Trans></h3>
                <p className="text-[#363942]">
                  {course.teacherName || <span className="text-[#363942]/50"><Trans>No teacher assigned</Trans></span>}
                </p>
              </div>

              {(course.youtubeUrl || course.zoomUrl) && (
                <div>
                  <h3 className="text-lg font-bold text-[#17224D] mb-3"><Trans>Course Links</Trans></h3>
                  <div className="space-y-2">
                    {course.youtubeUrl && (
                      <a
                        href={course.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#007FFF] hover:text-[#0066CC]"
                      >
                        <Video className="w-4 h-4" />
                        <Trans>YouTube Video</Trans>
                      </a>
                    )}
                    {course.zoomUrl && (
                      <a
                        href={course.zoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#007FFF] hover:text-[#0066CC]"
                      >
                        <Video className="w-4 h-4" />
                        <Trans>Zoom Meeting</Trans>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#363942]/70"><Trans>Created</Trans></p>
                    <p className="text-[#17224D] font-medium">{new Date(course.created).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[#363942]/70"><Trans>Last Updated</Trans></p>
                    <p className="text-[#17224D] font-medium">{new Date(course.updated).toLocaleDateString()}</p>
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
