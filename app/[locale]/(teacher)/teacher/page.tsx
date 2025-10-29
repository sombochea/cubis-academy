import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/drizzle/queries';

export default async function TeacherDashboard() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'teacher') {
    redirect('/login');
  }

  const user = await getUserById(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CUBIS Academy - Teacher</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user?.name}</span>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Teacher Dashboard</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Welcome to your teacher dashboard!</p>
          <p className="text-sm text-gray-500 mt-2">Course management features coming soon.</p>
        </div>
      </div>
    </div>
  );
}
