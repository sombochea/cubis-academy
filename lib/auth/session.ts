import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

export async function requireRole(role: 'student' | 'teacher' | 'admin') {
  const session = await requireAuth();
  if (session.user.role !== role && session.user.role !== 'admin') {
    redirect('/unauthorized');
  }
  return session;
}

export async function getSession() {
  return await auth();
}
