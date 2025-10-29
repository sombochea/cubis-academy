import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAllCourses } from '@/lib/drizzle/queries';
import Link from 'next/link';

export default async function CoursesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const courses = await getAllCourses();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/student" className="text-xl font-bold text-gray-900">
                CUBIS Academy
              </Link>
              <Link href="/student/courses" className="text-sm font-medium text-blue-600">
                Courses
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>

        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No courses available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 uppercase">
                      {course.level}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ${course.price}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.desc || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{course.category}</span>
                    {course.duration && <span>{course.duration}h</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Teacher: {course.teacher?.user?.name || 'TBA'}
                  </p>
                  <Link
                    href={`/student/courses/${course.id}`}
                    className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
