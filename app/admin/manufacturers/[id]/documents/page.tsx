"use client";

import { FileText, Download, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useEffect, use, useMemo } from "react";

import { ProductDocuments } from "@/components/dashboard/products/product-documents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Error } from "@/components/ui/error";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { CompanyDocumentService } from "@/lib/services/companyDocument";
import { DocumentService } from "@/lib/services/document";
import { supabase } from "@/lib/supabase/client";
import { Document } from "@/lib/types/document";
import { getStatusIcon } from "@/lib/utils/document-utils";

function getPaginationRange(current: number, total: number): (number | string)[] {
  if (total <= 1) return [1];
  
  const delta = 2;
  const range: (number | string)[] = [];
  
  // Her zaman ilk sayfayı ekle
  range.push(1);
  
  // Orta kısmı oluştur
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  
  // Son sayfayı ekle (eğer toplam sayfa sayısı 1'den büyükse)
  if (total > 1) {
    range.push(total);
  }
  
  // Eksik sayıları "..." ile doldur
  const result: (number | string)[] = [];
  for (let i = 0; i < range.length; i++) {
    if (i > 0 && typeof range[i] === 'number' && typeof range[i - 1] === 'number' && Number(range[i]) - Number(range[i - 1]) > 1) {
      result.push('...');
    }
    result.push(range[i]);
  }
  
  return result;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ManufacturerDocumentsPage({ params }: PageProps) {
  const t = useTranslations();
  const { id: manufacturerId } = use(params);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

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

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setIsLoading(true);
        const { data: companyDocs, error } = await supabase
          .from("company_documents")
          .select("*")
          .eq("companyId", manufacturerId);
        
        if (error) {
          throw error;
        }

        // Veri kontrolü ve dönüşümü
        const docsArray = Array.isArray(companyDocs) ? companyDocs : [];
        const filteredDocs = docsArray.filter(doc => {
          if (!doc) return false;
          // filePath değeri olmayan belgeleri filtrele
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
        }).map(doc => {
          const filePath = doc.filePath;
          const fileName = filePath.split('/').pop() || 'Unnamed Document';
          
          return {
            ...doc,
            name: doc.name || fileName,
            type: doc.type || 'Unknown',
            status: doc.status || 'pending',
            fileSize: doc.fileSize || '0 KB',
            version: doc.version || '1.0',
            filePath: filePath
          };
        });

        setDocuments(filteredDocs);
      } catch (err) {
        setError(err as Error);
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (manufacturerId) {
      fetchDocuments();
    } else {
      setDocuments([]);
      setIsLoading(false);
    }
  }, [manufacturerId]);

  // Filtreleme işlemi
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return documents.filter((doc) =>
      statusFilter === "all" ? true : doc?.status === statusFilter
    );
  }, [documents, statusFilter]);

  // Sayfalama hesaplamaları
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil((filteredDocuments?.length || 0) / ITEMS_PER_PAGE))
  , [filteredDocuments]);

  const paginatedDocuments = useMemo(() => 
    filteredDocuments.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )
  , [filteredDocuments, currentPage, ITEMS_PER_PAGE]);

  // Sayfa değiştiğinde currentPage'i sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Sayfalama aralığını hesapla
  const paginationRange = useMemo(() => 
    getPaginationRange(currentPage, totalPages)
  , [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRejectConfirm = () => {
    // Implement the logic to reject the document
    setShowRejectDialog(false);
    setRejectionReason("");
    setSelectedProductId(null);
  };

  const handleDownload = async (doc: Document) => {
    try {
      if (!doc.filePath) {
        toast({
          title: "Error",
          description: "Document URL not available",
          variant: "destructive",
        });
        return;
      }

      // Doğrudan Supabase storage'dan public URL al
      const { data: { publicUrl } } = supabase.storage
        .from("company-documents")
        .getPublicUrl(doc.filePath);

      if (!publicUrl) {
        toast({
          title: "Error",
          description: "Document URL not available",
          variant: "destructive",
        });
        return;
      }

      // Belgeyi yeni sekmede aç
      window.open(publicUrl, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open document",
        variant: "destructive",
      });
    }
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
        <div className="flex items-center gap-4">
          <Link href="/admin/manufacturers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("documentManagement.backToList")}
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">
            {t("documentManagement.title")}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("documentManagement.repository.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t("documentManagement.repository.noDocumentsFound")}</h2>
              <p className="text-muted-foreground mb-4">
                {documents.length === 0
                  ? "No documents have been uploaded yet."
                  : "No documents match the current filter criteria."}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("documentManagement.repository.document")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDocuments.map((doc, index) => (
                    <TableRow key={`${doc.id}-${doc.type}-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="font-medium truncate max-w-[200px]">
                                    {documentTypeLabels[doc.type] || doc.name}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="start">
                                  {/* Dosya boyutu veya ID gösterilmeyecek */}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && filteredDocuments.length > 0 && (
                <nav className="flex justify-center items-center gap-1 mt-6 select-none" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 text-lg
                      ${currentPage === 1 ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed' : 'bg-white hover:bg-muted/70 border-muted text-muted-foreground'}`}
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {paginationRange.map((page, idx) =>
                    typeof page === 'string'
                      ? <span key={"ellipsis-"+idx} className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm">...</span>
                      : <button
                          key={page}
                          onClick={() => handlePageChange(Number(page))}
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 text-lg
                      ${currentPage === totalPages ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed' : 'bg-white hover:bg-muted/70 border-muted text-muted-foreground'}`}
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {t("documentManagement.repository.title")}
            </DialogTitle>
            <DialogDescription>
              {t("documentManagement.repository.description.forManufacturer")}
            </DialogDescription>
          </DialogHeader>
          {selectedProductId && (
            <div className="space-y-4">
              <ProductDocuments productId={selectedProductId} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("documentManagement.repository.reject.title")}
            </DialogTitle>
            <DialogDescription>
              {t("documentManagement.repository.reject.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="rejection-reason">
              {t("documentManagement.repository.reject.reasonLabel")}
            </Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t("documentManagement.repository.reject.reasonPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedProductId(null);
              }}
            >
              {t("documentManagement.repository.reject.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              {t("documentManagement.repository.reject.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 