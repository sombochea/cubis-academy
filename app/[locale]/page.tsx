import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/landing-page';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (session?.user) {
    const role = session.user.role;
    if (role === 'admin') redirect(`/${locale}/admin`);
    if (role === 'teacher') redirect(`/${locale}/teacher`);
    redirect(`/${locale}/student`);
  }

  return <LandingPage />;
}
