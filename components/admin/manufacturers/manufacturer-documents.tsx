"use client";

import { Download, FileText, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ManufacturerDocumentsProps {
  manufacturerId: string;
}

// Belge tipinden Türkçe isim eşleştirmesi
const documentTypeLabels: Record<string, string> = {
  tax_plate: "Vergi Levhası",
  export_certificate: "İhracat Sertifikası",
  quality_certificate: "Kalite Sertifikası",
  production_permit: "Üretim İzni",
  iso_certificate: "ISO Sertifikası",
  signature_circular: "İmza Sirküleri",
  trade_registry_gazette: "Ticaret Sicil Gazetesi",
  activity_certificate: "Faaliyet Belgesi",
  // Diğer tipler eklenebilir
};

export function ManufacturerDocuments({ manufacturerId }: ManufacturerDocumentsProps) {
  const t = useTranslations("adminDashboard.manufacturers.details");
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
      if (!manufacturerId) {
        setDocuments([]);
        setLoading(false);
        return;
      }
      try {
        const { data: companyDocs, error } = await supabase
          .from("company_documents")
          .select("*")
          .eq("companyId", manufacturerId);

        if (error) {
          console.error("Error fetching documents:", error);
          setDocuments([]);
          return;
        }

        const filteredDocs = (companyDocs || []).filter(doc => {
          if (!doc) return false;
          if (!doc.filePath) return false;
          return (
            !doc.productId ||
            doc.productId === null ||
            doc.productId === undefined ||
            doc.productId === "" ||
            doc.productId === "null" ||
            doc.productId === "undefined" ||
            doc.productId === 0 ||
            doc.productId === false ||
            (typeof doc.productId === "number" && isNaN(doc.productId))
          );
        }).map(doc => ({
          ...doc,
          name: doc.name || 'Unnamed Document',
          type: doc.type || 'Unknown',
          status: doc.status || 'pending',
          filePath: doc.filePath || '',
          uploadedAt: doc.uploadedAt || new Date().toISOString()
        }));

        setDocuments(filteredDocs);
      } catch (err) {
        console.error("Error in fetchDocuments:", err);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [manufacturerId]);

  if (loading) return <div>Yükleniyor...</div>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Belgeler</CardTitle>
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
                  <p className="font-medium">
                    {documentTypeLabels[doc.type] || doc.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!doc.filePath}
                  onClick={async () => {
                    if (!doc.filePath) return;
                    try {
                      const { data: { publicUrl } } = supabase.storage
                        .from("company-documents")
                        .getPublicUrl(doc.filePath);

                      if (!publicUrl) {
                        console.error("No public URL available for document");
                        return;
                      }

                      // Belgeyi yeni sekmede aç
                      window.open(publicUrl, '_blank');
                    } catch (error) {
                      console.error("Error opening document:", error);
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