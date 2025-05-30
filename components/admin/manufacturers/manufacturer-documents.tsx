"use client";

import { Download, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DocumentService } from "@/lib/services/document";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ManufacturerDocumentsProps {
  manufacturerId: string;
}

export function ManufacturerDocuments({ manufacturerId }: ManufacturerDocumentsProps) {
  const t = useTranslations("adminDashboard.sections.manufacturers.details");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDocuments = documents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  function getPaginationRange(current: number, total: number): (number | string)[] {
    const delta = 2;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < total - 1) {
      range.push('...');
    }
    range.unshift(1);
    if (total > 1) range.push(total);
    return range;
  }

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      const docs = await DocumentService.getDocumentsByManufacturer(manufacturerId);
      console.log("Fetched documents:", docs);
      setDocuments(docs);
      setLoading(false);
    }
    fetchDocuments();
  }, [manufacturerId]);

  if (loading) return <div>Loading...</div>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("documents.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.length === 0 && <div>{t("documents.list.empty.description")}</div>}
          {paginatedDocuments.map((doc, idx) => (
            <div
              key={doc.id ? doc.id + '-' + idx : idx}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-start gap-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{doc.type}</span>
                    <span>·</span>
                    <span>
                      {t("documents.uploadedAt")} {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    doc.status === "verified" || doc.status === "approved"
                      ? "success"
                      : doc.status === "rejected"
                      ? "destructive"
                      : "warning"
                  }
                >
                  {t(`documents.status.${doc.status.toUpperCase()}`)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!doc.url}
                  onClick={async () => {
                    if (!doc.url) return;
                    try {
                      const response = await fetch(doc.url);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = doc.name || "document";
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    } catch (error) {
                      console.error("Error downloading document:", error);
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {/* Pagination UI */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-1 mt-6 select-none" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 text-lg
                  ${currentPage === 1 ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed' : 'bg-white hover:bg-muted/70 border-muted text-muted-foreground'}`}
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPaginationRange(currentPage, totalPages).map((page, idx) =>
                typeof page === 'string'
                  ? <span key={"ellipsis-"+idx} className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm">...</span>
                  : <button
                      key={page}
                      onClick={() => setCurrentPage(Number(page))}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 font-medium
                        ${currentPage === page
                          ? 'bg-primary/10 text-primary border-primary font-semibold'
                          : 'bg-white text-muted-foreground border-muted hover:bg-muted/70'}
                      `}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
              )}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 text-lg
                  ${currentPage === totalPages ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed' : 'bg-white hover:bg-muted/70 border-muted text-muted-foreground'}`}
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}
        </div>
      </CardContent>
    </Card>
  );
}