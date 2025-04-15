"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { DocumentHeader } from "@/components/admin/documents/document-header";
import { DocumentList } from "@/components/admin/documents/document-list";
import { documentsApiHooks } from "@/lib/hooks/use-documents";

export const dynamic = "force-dynamic";

export default function DocumentsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");

  const {
    data: documents,
    isLoading,
    error,
  } = documentsApiHooks.useGetDocuments();

  const filteredDocuments = productId
    ? documents?.filter((doc) => doc.productId === productId)
    : documents;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-semibold text-destructive">
          {t("documentManagement.repository.error.title")}
        </h2>
        <p className="text-muted-foreground">
          {error instanceof Error
            ? error.message
            : t("common.error.unexpectedError")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("documentManagement.title")}
          </h1>{" "}
          <p className="text-muted-foreground">
            {productId
              ? t("documentManagement.repository.description.forProduct")
              : t("documentManagement.repository.description")}
          </p>
        </div>
      </div>
      <DocumentHeader />
      <DocumentList initialDocuments={filteredDocuments || []} />
    </div>
  );
}
