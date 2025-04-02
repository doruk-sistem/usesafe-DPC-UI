import { DocumentHeader } from "@/components/dashboard/documents/document-header";
import { DocumentList } from "@/components/dashboard/documents/document-list";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "@/app/i18n/i18n";

export default async function DocumentsPage() {
  const messages = await getTranslations('tr');
  
  return (
    <NextIntlClientProvider messages={messages} locale="tr">
      <div className="space-y-6">
        <DocumentHeader />
        <DocumentList />
      </div>
    </NextIntlClientProvider>
  );
}