import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getCourseById } from '@/lib/drizzle/queries';
import { db } from '@/lib/drizzle/db';
import { enrollments } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import EnrollButton from '@/components/enroll-button';

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <Link href="/student/courses" className="text-blue-600 hover:text-blue-700">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // Check if already enrolled
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.studentId, session.user.id),
      eq(enrollments.courseId, id)
    ),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/student" className="text-xl font-bold text-gray-900">
                CUBIS Academy
              </Link>
              <Link href="/student/courses" className="text-sm text-gray-600 hover:text-blue-600">
                ← Back to Courses
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold uppercase">
                {course.level}
              </span>
              <span className="text-3xl font-bold">${course.price}</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-blue-100 text-lg">{course.category}</p>
          </div>

          {/* Course Details */}
          <div className="p-8">
            {enrollment && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  ✓ You are enrolled in this course
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Progress: {enrollment.progress}%
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-xl font-bold text-gray-900">{course.duration}h</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{course.level}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-xl font-bold text-gray-900">{course.category}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-xl font-bold text-gray-900">${course.price}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
              <p className="text-gray-600 leading-relaxed">
                {course.desc || 'No description available.'}
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructor</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {course.teacher?.user?.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{course.teacher?.user?.name || 'TBA'}</p>
                  <p className="text-sm text-gray-600">{course.teacher?.spec || 'Instructor'}</p>
                </div>
              </div>
            </div>

            {course.youtubeUrl && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Materials</h2>
                <a
                  href={course.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  📺 Watch on YouTube
                </a>
              </div>
            )}

            {!enrollment ? (
              <EnrollButton courseId={id} courseName={course.title} price={course.price} />
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/student/enrollments"
                  className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-semibold"
                >
                  Go to My Courses
                </Link>
                {course.zoomUrl && (
                  <a
                    href={course.zoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center font-semibold"
                  >
                    Join Live Session
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
