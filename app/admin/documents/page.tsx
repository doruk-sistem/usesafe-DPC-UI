"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { DocumentHeader } from "@/components/admin/documents/document-header";
import { DocumentList } from "@/components/admin/documents/document-list";
import { Error } from "@/components/ui/error";
import { Loading } from "@/components/ui/loading";
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
    return <Loading />;
  }

  if (error) {
    return (
      <Error 
        title={t("documentManagement.repository.error.title")}
        error={error}
      />
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
