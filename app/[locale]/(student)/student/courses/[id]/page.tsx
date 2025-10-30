import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, enrollments, users, teachers } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import { Trans } from '@lingui/react/macro';
import { StudentNav } from '@/components/student/StudentNav';
import { EnrollButton } from '@/components/student/EnrollButton';
import { TeacherProfilePopover } from '@/components/student/TeacherProfilePopover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Award, 
  User,
  Video,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function CourseDetailPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { locale, id } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Get course with teacher info
  const [courseData] = await db
    .select({
      id: courses.id,
      title: courses.title,
      desc: courses.desc,
      category: courses.category,
      price: courses.price,
      duration: courses.duration,
      level: courses.level,
      youtubeUrl: courses.youtubeUrl,
      zoomUrl: courses.zoomUrl,
      teacherId: courses.teacherId,
      teacherName: users.name,
      teacherPhoto: teachers.photo,
      teacherSpec: teachers.spec,
      teacherBio: teachers.bio,
    })
    .from(courses)
    .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(eq(courses.id, id));

  // Get teacher's course count if teacher exists
  let teacherCourseCount = 0;
  if (courseData.teacherId) {
    const teacherCourses = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.teacherId, courseData.teacherId), eq(courses.isActive, true)));
    teacherCourseCount = teacherCourses.length;
  }

  if (!courseData) {
    redirect(`/${locale}/student/courses`);
  }

  // Check if already enrolled
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.studentId, session.user.id),
      eq(enrollments.courseId, id)
    ),
  });

  const isFree = Number(courseData.price) === 0;

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <StudentNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={`/${locale}/student/courses`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <Trans>Back to Courses</Trans>
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-br from-[#007FFF] to-[#17224D] p-8 text-white">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    courseData.level === 'beginner'
                      ? 'bg-green-500/20 text-green-100'
                      : courseData.level === 'intermediate'
                      ? 'bg-yellow-500/20 text-yellow-100'
                      : 'bg-red-500/20 text-red-100'
                  }`}>
                    <Trans>{courseData.level}</Trans>
                  </span>
                  {isFree ? (
                    <span className="px-4 py-2 bg-green-500 text-white rounded-full text-lg font-bold">
                      <Trans>FREE</Trans>
                    </span>
                  ) : (
                    <span className="text-4xl font-bold">${Number(courseData.price).toFixed(2)}</span>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-3">{courseData.title}</h1>
                {courseData.category && (
                  <p className="text-blue-100 text-lg">{courseData.category}</p>
                )}
              </div>

              {enrollment && (
                <div className="p-6 bg-green-50 border-b border-green-100">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">
                        <Trans>You are enrolled in this course</Trans>
                      </p>
                      <p className="text-sm text-green-600">
                        <Trans>Progress:</Trans> {enrollment.progress}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-8">
                <h2 className="text-2xl font-bold text-[#17224D] mb-4">
                  <Trans>About This Course</Trans>
                </h2>
                <p className="text-[#363942] leading-relaxed whitespace-pre-wrap">
                  {courseData.desc || <Trans>No description available.</Trans>}
                </p>
              </div>
            </div>

            {/* Course Materials */}
            {(courseData.youtubeUrl || courseData.zoomUrl) && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#17224D] mb-4">
                  <Trans>Course Materials</Trans>
                </h2>
                <div className="space-y-3">
                  {courseData.youtubeUrl && (
                    <a
                      href={courseData.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Video className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-700">
                        <Trans>Watch on YouTube</Trans>
                      </span>
                      <ExternalLink className="w-4 h-4 text-red-600 ml-auto" />
                    </a>
                  )}
                  {courseData.zoomUrl && enrollment && (
                    <a
                      href={courseData.zoomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Video className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-700">
                        <Trans>Join Live Session</Trans>
                      </span>
                      <ExternalLink className="w-4 h-4 text-blue-600 ml-auto" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Instructor */}
            {courseData.teacherName && courseData.teacherId && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#17224D] mb-4">
                  <Trans>Instructor</Trans>
                </h2>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 flex-shrink-0">
                    <AvatarImage src={courseData.teacherPhoto || undefined} alt={courseData.teacherName} />
                    <AvatarFallback className="bg-gradient-to-br from-[#007FFF] to-[#17224D] text-white text-2xl font-bold">
                      {courseData.teacherName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <TeacherProfilePopover
                      teacher={{
                        id: courseData.teacherId,
                        name: courseData.teacherName,
                        photo: courseData.teacherPhoto,
                        bio: courseData.teacherBio,
                        spec: courseData.teacherSpec,
                        courseCount: teacherCourseCount,
                      }}
                      locale={locale}
                    >
                      <h3 className="font-semibold text-[#17224D] text-lg hover:text-[#007FFF] transition-colors">
                        {courseData.teacherName}
                      </h3>
                    </TeacherProfilePopover>
                    {courseData.teacherSpec && (
                      <p className="text-sm text-[#007FFF] mb-2">{courseData.teacherSpec}</p>
                    )}
                    {courseData.teacherBio && (
                      <p className="text-sm text-[#363942]/70 line-clamp-2">{courseData.teacherBio}</p>
                    )}
                    <Link href={`/${locale}/student/instructors/${courseData.teacherId}`}>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Trans>View Profile</Trans>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-[#17224D] mb-4">
                <Trans>Course Info</Trans>
              </h3>
              <div className="space-y-4">
                {courseData.duration && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#007FFF]" />
                    <div>
                      <p className="text-sm text-[#363942]/70">
                        <Trans>Duration</Trans>
                      </p>
                      <p className="font-medium text-[#17224D]">{courseData.duration} hours</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#007FFF]" />
                  <div>
                    <p className="text-sm text-[#363942]/70">
                      <Trans>Level</Trans>
                    </p>
                    <p className="font-medium text-[#17224D] capitalize">
                      <Trans>{courseData.level}</Trans>
                    </p>
                  </div>
                </div>
                {courseData.category && (
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-[#007FFF]" />
                    <div>
                      <p className="text-sm text-[#363942]/70">
                        <Trans>Category</Trans>
                      </p>
                      <p className="font-medium text-[#17224D]">{courseData.category}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enroll Button */}
            {!enrollment ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <EnrollButton 
                  courseId={id} 
                  courseName={courseData.title}
                  price={courseData.price}
                  isFree={isFree}
                  locale={locale}
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <Link href={`/${locale}/student/enrollments`}>
                  <Button className="w-full" size="lg">
                    <Trans>Go to My Courses</Trans>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
