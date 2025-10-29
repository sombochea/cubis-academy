import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/landing-page';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const role = session.user.role;
    if (role === 'admin') redirect('/admin');
    if (role === 'teacher') redirect('/teacher');
    redirect('/student');
  }

  return <LandingPage />;
}
