import { RejectPaymentForm } from "@/components/admin/RejectPaymentForm";
import { setI18n } from "@lingui/react/server";
import { loadCatalog, i18n } from "@/lib/i18n";

export default async function RejectPaymentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <RejectPaymentForm paymentId={id} locale={locale} />
    </div>
  );
}
