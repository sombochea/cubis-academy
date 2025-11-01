import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { AdminNav } from '@/components/admin/AdminNav';
import { CategoriesDataTable } from '@/components/admin/CategoriesDataTable';
import { CategoryService } from '@/lib/services/category.service';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

// Loading component
function TableLoading() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Data fetching component
async function CategoriesTable({ locale }: { locale: string }) {
  const categories = await CategoryService.getAllCategories();
  return <CategoriesDataTable data={categories} locale={locale} />;
}

export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await loadCatalog(locale);
  setI18n(i18n);
  
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <AdminNav locale={locale} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header renders immediately */}
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

        {/* Table loads independently with Suspense */}
        <Suspense fallback={<TableLoading />}>
          <CategoriesTable locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
