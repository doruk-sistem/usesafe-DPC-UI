"use client";

import { useSearchParams } from "next/navigation";

import { DocumentHeader } from "@/components/admin/documents/document-header";
import { DocumentList } from "@/components/admin/documents/document-list";
import { documentsApiHooks } from "@/lib/hooks/use-documents";

export const dynamic = "force-dynamic";

export default function DocumentsPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");
  
  const { data: documents, isLoading, error } = documentsApiHooks.useGetDocuments();

  const filteredDocuments = productId 
    ? documents?.filter(doc => doc.productId === productId)
    : documents;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-semibold text-destructive">
          Error Loading Documents
        </h2>
        <p className="text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="text-muted-foreground">
            {productId
              ? "View and manage documents for this product"
              : "View and manage all documents"}
          </p>
        </div>
      </div>
      <DocumentHeader />
      <DocumentList initialDocuments={filteredDocuments || []} />
    </div>
  );
}
