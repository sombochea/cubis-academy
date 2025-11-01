import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, enrollments, courseCategories } from '@/lib/drizzle/schema';
import { eq, and, count } from 'drizzle-orm';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { CoursesDataTable } from '@/components/teacher/CoursesDataTable';
import { CourseActionsMenu } from '@/components/teacher/CourseActionsMenu';
import { Trans } from '@lingui/react/macro';
import { BookOpen, Users } from 'lucide-react';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function TeacherCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  const session = await auth();

  if (!session?.user || session.user.role !== 'teacher') {
    redirect(`/${locale}/login`);
  }

  // Get teacher's courses with enrollment counts
  const teacherCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      desc: courses.desc,
      category: courses.category,
      category_id: courses.categoryId,
      category_name: courseCategories.name,
      level: courses.level,
      price: courses.price,
      duration: courses.duration,
      deliveryMode: courses.deliveryMode,
      isActive: courses.isActive,
      created: courses.created,
    })
    .from(courses)
    .leftJoin(courseCategories, eq(courses.categoryId, courseCategories.id))
    .where(eq(courses.teacherId, session.user.id))
    .orderBy(courses.created);

  // Get enrollment counts for each course
  const enrollmentCounts = await Promise.all(
    teacherCourses.map(async (course) => {
      const [result] = await db
        .select({ count: count() })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.courseId, course.id),
            eq(enrollments.status, 'active')
          )
        );
      return { courseId: course.id, count: result?.count || 0 };
    })
  );

  const enrollmentMap = new Map(
    enrollmentCounts.map((e) => [e.courseId, e.count])
  );

  // Prepare courses data for DataTable
  const coursesWithEnrollments = teacherCourses.map((course) => ({
    ...course,
    enrollmentCount: enrollmentMap.get(course.id) || 0,
  }));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#17224D] mb-2">
              <Trans>My Courses</Trans>
            </h1>
            <p className="text-[#363942]/70">
              <Trans>Manage your courses and track student progress</Trans>
            </p>
          </div>
          <CourseActionsMenu locale={locale} />
        </div>

        {/* Stats - At least 2 columns on small devices */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {teacherCourses.length}
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Total Courses</Trans>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {teacherCourses.filter((c) => c.isActive).length}
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Active Courses</Trans>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#17224D]">
                  {Array.from(enrollmentMap.values()).reduce(
                    (a, b) => a + b,
                    0
                  )}
                </div>
                <div className="text-sm text-[#363942]/70">
                  <Trans>Total Students</Trans>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses List */}
        {teacherCourses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-[#363942]/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#17224D] mb-2">
              <Trans>No courses yet</Trans>
            </h3>
            <p className="text-[#363942]/70 mb-6">
              <Trans>Create your first course to get started</Trans>
            </p>
            <div className="flex justify-center">
              <CourseActionsMenu locale={locale} />
            </div>
          </div>
        ) : (
          <CoursesDataTable courses={coursesWithEnrollments} locale={locale} />
        )}
      </div>
    </div>
  );
}
