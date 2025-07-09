"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { DocumentHeader } from "@/components/admin/documents/document-header";
import { DocumentList } from "@/components/admin/documents/document-list";
import { Error } from "@/components/ui/error";
import { Loading } from "@/components/ui/loading";
import { DocumentService } from "@/lib/services/document";
import { Document } from "@/lib/types/document";

export default function DocumentsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const manufacturerId = searchParams.get("manufacturer");
  const [filters, setFilters] = useState({
    type: "all",
    status: "all-status"
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setIsLoading(true);
        let docs: Document[] = [];

        if (manufacturerId) {
          docs = await DocumentService.getDocumentsByManufacturer(manufacturerId);
        }

        setDocuments(docs);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, [manufacturerId]);

  const handleFilterChange = (key: 'type' | 'status', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

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
            {/* {t("documentManagement.title")} */}
          </h1>{" "}
          {/* <p className="text-muted-foreground">
            {manufacturerId
              ? t("documentManagement.repository.description.forManufacturer")
              : t("documentManagement.repository.description")}
          </p> */}
        </div>
      </div>
      <DocumentHeader onFilterChange={handleFilterChange} filters={filters} />
      <DocumentList initialDocuments={documents} filters={filters} />
    </div>
  );
}
