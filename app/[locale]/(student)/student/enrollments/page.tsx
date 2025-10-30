import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { enrollments, courses, scores, attendances, teachers, users } from '@/lib/drizzle/schema';
import { eq, desc, count, avg } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { StudentNav } from '@/components/student/StudentNav';
import { MyCoursesGrid } from '@/components/student/MyCoursesGrid';
import { BookOpen, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function EnrollmentsPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Get enrollments with course and teacher details
  const enrollmentsList = await db
    .select({
      id: enrollments.id,
      courseId: courses.id,
      courseTitle: courses.title,
      courseDesc: courses.desc,
      courseCategory: courses.category,
      courseLevel: courses.level,
      coursePrice: courses.price,
      courseDuration: courses.duration,
      youtubeUrl: courses.youtubeUrl,
      zoomUrl: courses.zoomUrl,
      teacherId: courses.teacherId,
      teacherName: users.name,
      teacherPhoto: teachers.photo,
      teacherBio: teachers.bio,
      teacherSpec: teachers.spec,
      status: enrollments.status,
      progress: enrollments.progress,
      enrolled: enrollments.enrolled,
      completed: enrollments.completed,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(eq(enrollments.studentId, session.user.id))
    .orderBy(desc(enrollments.enrolled));

  // Get course counts for each teacher
  const teacherCourseCountsMap = new Map<string, number>();
  for (const enrollment of enrollmentsList) {
    if (enrollment.teacherId) {
      if (!teacherCourseCountsMap.has(enrollment.teacherId)) {
        const count = enrollmentsList.filter(e => e.teacherId === enrollment.teacherId).length;
        teacherCourseCountsMap.set(enrollment.teacherId, count);
      }
    }
  }

  // Calculate stats
  const totalEnrollments = enrollmentsList.length;
  const activeEnrollments = enrollmentsList.filter(e => e.status === 'active').length;
  const completedEnrollments = enrollmentsList.filter(e => e.status === 'completed').length;
  const avgProgress = totalEnrollments > 0
    ? Math.round(enrollmentsList.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments)
    : 0;

  const stats = [
    {
      title: <Trans>Total Courses</Trans>,
      value: totalEnrollments,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: <Trans>Active</Trans>,
      value: activeEnrollments,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: <Trans>Completed</Trans>,
      value: completedEnrollments,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: <Trans>Avg Progress</Trans>,
      value: `${avgProgress}%`,
      icon: Award,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <StudentNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#17224D] mb-2">
              <Trans>My Courses</Trans>
            </h2>
            <p className="text-[#363942]/70">
              <Trans>Track your learning progress and access course materials</Trans>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-[#17224D] mb-1">{stat.value}</div>
                <div className="text-sm text-[#363942]/70 font-medium">{stat.title}</div>
              </div>
            );
          })}
        </div>

        <MyCoursesGrid 
          enrollments={enrollmentsList} 
          locale={locale}
          teacherCourseCountsMap={teacherCourseCountsMap}
        />
      </div>
    </div>
  );
}
