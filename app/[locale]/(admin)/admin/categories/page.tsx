import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courseCategories } from '@/lib/drizzle/schema';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { CategoriesDataTable } from '@/components/admin/CategoriesDataTable';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  const categories = await db
    .select()
    .from(courseCategories)
    .orderBy(courseCategories.name);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#17224D] mb-2">
              <Trans>Course Categories</Trans>
            </h2>
            <p className="text-[#363942]/70">
              <Trans>Manage course categories and organization</Trans>
            </p>
          </div>
          <Link
            href={`/${locale}/admin/categories/new`}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-xl hover:shadow-xl transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            <Trans>Add Category</Trans>
          </Link>
        </div>

        <CategoriesDataTable data={categories} locale={locale} />
      </div>
    </div>
  );
}
