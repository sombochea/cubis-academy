import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, users, teachers } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { AdminNav } from '@/components/admin/AdminNav';
import { CreateCourseWizard } from '@/components/admin/CreateCourseWizard';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function EditCoursePage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { locale, id } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id));

  if (!course) {
    notFound();
  }

  const teachersList = await db
    .select({
      userId: teachers.userId,
      name: users.name,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(eq(users.isActive, true));

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreateCourseWizard 
          locale={locale} 
          teachers={teachersList}
          courseId={id}
          initialData={{
            title: course.title,
            desc: course.desc || '',
            categoryId: course.categoryId || '',
            teacherId: course.teacherId || '',
            price: course.price,
            duration: String(course.duration),
            level: course.level,
            youtubeUrl: course.youtubeUrl || '',
            zoomUrl: course.zoomUrl || '',
            coverImage: course.coverImage || '',
          }}
        />
      </div>
    </div>
  );
}
