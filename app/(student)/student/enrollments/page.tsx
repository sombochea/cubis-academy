import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getStudentEnrollments } from '@/lib/drizzle/queries';
import Link from 'next/link';

export default async function EnrollmentsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const enrollments = await getStudentEnrollments(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/student" className="text-xl font-bold text-gray-900">
                CUBIS Academy
              </Link>
              <Link href="/student/enrollments" className="text-sm font-medium text-blue-600">
                My Courses
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Enrolled Courses</h2>
          <p className="text-gray-600 mt-2">Track your learning progress</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
            <Link
              href="/student/courses"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment: any) => (
              <div key={enrollment.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                      enrollment.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {enrollment.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {enrollment.course.level}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {enrollment.course.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {enrollment.course.category}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/student/courses/${enrollment.course.id}`}
                      className="flex-1 text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      View Course
                    </Link>
                    {enrollment.course.zoomUrl && (
                      <a
                        href={enrollment.course.zoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        title="Join Live Session"
                      >
                        🎥
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Enrolled: {new Date(enrollment.enrolled).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
