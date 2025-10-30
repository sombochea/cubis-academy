import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, students } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { StudentNav } from '@/components/student/StudentNav';
import { SettingsPage } from '@/components/SettingsPage';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function StudentSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));

  let roleData = null;
  if (user.role === 'student') {
    [roleData] = await db.select().from(students).where(eq(students.userId, user.id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav locale={locale} />
      <div className="container mx-auto px-4 py-8">
        <SettingsPage locale={locale} user={user} roleData={roleData} />
      </div>
    </div>
  );
}
