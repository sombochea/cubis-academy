import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { teachers, users, courses } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { Trans } from '@lingui/react/macro';
import { StudentNav } from '@/components/student/StudentNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Award,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Monitor,
} from 'lucide-react';
import Link from 'next/link';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function InstructorProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Get teacher profile with user details
  const [teacher] = await db
    .select({
      id: teachers.userId,
      name: users.name,
      email: users.email,
      phone: users.phone,
      photo: teachers.photo,
      bio: teachers.bio,
      spec: teachers.spec,
      schedule: teachers.schedule,
      created: users.created,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(eq(teachers.userId, id));

  if (!teacher) {
    notFound();
  }

  // Get teacher's courses
  const teacherCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      desc: courses.desc,
      category: courses.category,
      level: courses.level,
      price: courses.price,
      duration: courses.duration,
      deliveryMode: courses.deliveryMode,
      location: courses.location,
      isActive: courses.isActive,
    })
    .from(courses)
    .where(and(eq(courses.teacherId, id), eq(courses.isActive, true)));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const levelConfig = {
    beginner: { label: <Trans>Beginner</Trans>, color: 'bg-green-100 text-green-700' },
    intermediate: { label: <Trans>Intermediate</Trans>, color: 'bg-yellow-100 text-yellow-700' },
    advanced: { label: <Trans>Advanced</Trans>, color: 'bg-red-100 text-red-700' },
  };

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

        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-6">
          {/* Cover with gradient */}
          <div className="h-48 bg-gradient-to-br from-[#007FFF] to-[#17224D] relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="absolute -top-20 left-8">
              <Avatar className="w-40 h-40 border-8 border-white shadow-xl">
                <AvatarImage src={teacher.photo || undefined} alt={teacher.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#007FFF] to-[#17224D] text-white text-4xl font-bold">
                  {getInitials(teacher.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div className="pt-24">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#17224D] mb-2">
                    {teacher.name}
                  </h1>
                  {teacher.spec && (
                    <div className="flex items-center gap-2 text-lg text-[#363942]/70 mb-4">
                      <Award className="w-5 h-5" />
                      <span>{teacher.spec}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#363942]/70">
                    {teacher.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        <span>{teacher.email}</span>
                      </div>
                    )}
                    {teacher.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        <span>{teacher.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>
                        <Trans>Joined</Trans>{' '}
                        {new Date(teacher.created).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                  <div className="text-center p-4 bg-[#F4F5F7] rounded-lg min-w-[100px]">
                    <div className="w-10 h-10 bg-[#007FFF]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-5 h-5 text-[#007FFF]" />
                    </div>
                    <p className="text-2xl font-bold text-[#17224D]">
                      {teacherCourses.length}
                    </p>
                    <p className="text-xs text-[#363942]/70">
                      <Trans>Courses</Trans>
                    </p>
                  </div>
                  <div className="text-center p-4 bg-[#F4F5F7] rounded-lg min-w-[100px]">
                    <div className="w-10 h-10 bg-[#007FFF]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <GraduationCap className="w-5 h-5 text-[#007FFF]" />
                    </div>
                    <p className="text-2xl font-bold text-[#17224D]">
                      <Trans>Expert</Trans>
                    </p>
                    <p className="text-xs text-[#363942]/70">
                      <Trans>Level</Trans>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#17224D] mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <Trans>About</Trans>
              </h2>
              {teacher.bio ? (
                <p className="text-[#363942] leading-relaxed whitespace-pre-line">
                  {teacher.bio}
                </p>
              ) : (
                <p className="text-[#363942]/70 italic">
                  <Trans>No bio available</Trans>
                </p>
              )}
            </div>
          </div>

          {/* Courses Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#17224D] mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <Trans>Courses by {teacher.name}</Trans>
              </h2>

              {teacherCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-[#363942]/20 mx-auto mb-4" />
                  <p className="text-[#363942]/70">
                    <Trans>No active courses at the moment</Trans>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacherCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/${locale}/student/courses/${course.id}`}
                      className="group"
                    >
                      <div className="bg-white border-2 border-gray-100 rounded-lg p-4 hover:border-[#007FFF] hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                              levelConfig[course.level].color
                            }`}
                          >
                            {levelConfig[course.level].label}
                          </span>
                        </div>

                        <h3 className="font-semibold text-[#17224D] mb-2 line-clamp-2 group-hover:text-[#007FFF] transition-colors">
                          {course.title}
                        </h3>

                        {course.desc && (
                          <p className="text-sm text-[#363942]/70 mb-3 line-clamp-2">
                            {course.desc}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-[#363942]/70">
                            {course.deliveryMode === 'online' ? (
                              <Monitor className="w-4 h-4" />
                            ) : course.deliveryMode === 'face_to_face' ? (
                              <Users className="w-4 h-4" />
                            ) : (
                              <Monitor className="w-4 h-4" />
                            )}
                            <span className="capitalize text-xs">
                              {course.deliveryMode === 'face_to_face'
                                ? 'Face-to-Face'
                                : course.deliveryMode === 'hybrid'
                                ? 'Hybrid'
                                : 'Online'}
                            </span>
                          </div>
                          <span className="font-bold text-[#007FFF]">
                            ${Number(course.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
