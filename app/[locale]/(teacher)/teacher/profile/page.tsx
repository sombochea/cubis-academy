import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, teachers } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { ProfileView } from '@/components/ProfileView';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  // Prioritize session photo (fresh from OAuth) over database photo
  const sessionUser = session.user as any;
  const userWithSessionPhoto = {
    ...user,
    photo: sessionUser.image || user.photo,
  };

  let roleData = null;
  if (user.role === 'teacher') {
    [roleData] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.userId, user.id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNav locale={locale} />
      <div className="container mx-auto px-4 py-8">
        <ProfileView user={userWithSessionPhoto} roleData={roleData} locale={locale} />
      </div>
    </div>
  );
}
