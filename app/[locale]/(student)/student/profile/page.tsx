import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { users, students, teachers } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { StudentNav } from '@/components/student/StudentNav';
import { ProfileForm } from '@/components/ProfileForm';
import { PasswordChangeForm } from '@/components/PasswordChangeForm';
import { Trans } from '@lingui/react/macro';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield } from 'lucide-react';

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

  let roleData = null;
  if (user.role === 'student') {
    [roleData] = await db
      .select()
      .from(students)
      .where(eq(students.userId, user.id));
  } else if (user.role === 'teacher') {
    [roleData] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.userId, user.id));
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-purple-500 to-purple-600';
      case 'teacher':
        return 'from-blue-500 to-blue-600';
      case 'student':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <StudentNav locale={locale} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#17224D] mb-2">
            <Trans>My Profile</Trans>
          </h2>
          <p className="text-[#363942]/70">
            <Trans>Manage your account settings and preferences</Trans>
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-gray-200 shadow-lg">
              <AvatarImage src={roleData?.photo || undefined} alt={user.name} />
              <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(user.role)} text-white font-bold text-2xl`}>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#17224D] mb-1">{user.name}</h3>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 capitalize">
                  <Trans>{user.role}</Trans>
                </span>
                {user.role === 'student' && roleData?.suid && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500 font-mono">{roleData.suid}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-[#17224D] mb-4">
              <Trans>Profile Information</Trans>
            </h3>
            <ProfileForm 
              user={user} 
              roleData={roleData}
              locale={locale}
            />
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-[#17224D] mb-4">
              <Trans>Change Password</Trans>
            </h3>
            <PasswordChangeForm locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
