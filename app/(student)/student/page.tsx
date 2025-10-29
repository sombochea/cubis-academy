import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/drizzle/queries';
import { db } from '@/lib/drizzle/db';
import { enrollments } from '@/lib/drizzle/schema';
import { eq, and, count } from 'drizzle-orm';
import Link from 'next/link';

async function getEnrollmentCount(userId: string) {
  const result = await db.select({ count: count() })
    .from(enrollments)
    .where(eq(enrollments.studentId, userId));
  return result[0]?.count || 0;
}

async function getCompletedCount(userId: string) {
  const result = await db.select({ count: count() })
    .from(enrollments)
    .where(and(
      eq(enrollments.studentId, userId),
      eq(enrollments.status, 'completed')
    ));
  return result[0]?.count || 0;
}

async function getActiveCount(userId: string) {
  const result = await db.select({ count: count() })
    .from(enrollments)
    .where(and(
      eq(enrollments.studentId, userId),
      eq(enrollments.status, 'active')
    ));
  return result[0]?.count || 0;
}

export default async function StudentDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const user = await getUserById(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CUBIS Academy</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {user?.name} ({user?.student?.suid})
              </span>
              <form action={async () => {
                'use server';
                const { signOut } = await import('@/auth');
                await signOut({ redirectTo: '/' });
              }}>
                <button className="text-sm text-red-600 hover:text-red-700">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h2>
          <p className="text-gray-600">Student ID: {user?.student?.suid}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/student/courses" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Courses</h3>
            <p className="text-sm text-gray-600">Explore and enroll in courses</p>
          </Link>
          <Link href="/student/enrollments" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Courses</h3>
            <p className="text-sm text-gray-600">View enrolled courses</p>
          </Link>
          <Link href="/student/payments" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payments</h3>
            <p className="text-sm text-gray-600">Payment history</p>
          </Link>
          <Link href="/student/profile" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-sm text-gray-600">Manage your profile</p>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.student ? await getEnrollmentCount(user.id) : 0}
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.student ? await getCompletedCount(user.id) : 0}
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.student ? await getActiveCount(user.id) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
