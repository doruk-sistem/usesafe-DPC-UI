"use client";

import { Download, FileText, ChevronLeft, ChevronRight, Check, X, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/hooks/use-toast";
import { CompanyDocumentService } from "@/lib/services/companyDocument";
import { supabase } from "@/lib/supabase/client";

interface CompanyDocumentsProps {
  companyId: string;
}

// Document type translation keys
const documentTypeLabels: Record<string, string> = {
  tax_plate: "tax_plate",
  export_certificate: "export_certificate",
  quality_certificate: "quality_certificate",
  production_permit: "production_permit",
  iso_certificate: "iso_certificate",
  signature_circular: "signature_circular",
  trade_registry_gazette: "trade_registry_gazette",
  activity_certificate: "activity_certificate",
  // Other types can be added
};

// Status badge configuration
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Onaylandı</Badge>;
    case 'rejected':
      return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">Reddedildi</Badge>;
    case 'pending':
    default:
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Beklemede</Badge>;
  }
};

export function CompanyDocuments({ companyId }: CompanyDocumentsProps) {
  const t = useTranslations("adminDashboard.companies.details");
  const tDocTypes = useTranslations("documents.types");
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingDocuments, setProcessingDocuments] = useState<Set<string>>(new Set());
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState("");
  
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDocuments = documents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleApproveDocument = async (documentId: string) => {
    if (!documentId) return;
    
    setProcessingDocuments(prev => new Set(prev).add(documentId));
    
    try {
      await CompanyDocumentService.updateDocumentStatus(documentId, 'approved');
      
      // Update local state
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'approved' }
            : doc
        )
      );
      
      toast({
        title: "Başarılı",
        description: "Döküman başarıyla onaylandı.",
      });
    } catch (error) {
      console.error("Error approving document:", error);
      toast({
        title: "Hata",
        description: "Döküman onaylanırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setProcessingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const handleRejectDocument = async () => {
    if (!selectedDocumentId || !rejectionReason.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen reddetme sebebini belirtin.",
        variant: "destructive",
      });
      return;
    }
    
    setProcessingDocuments(prev => new Set(prev).add(selectedDocumentId));
    
    try {
      await CompanyDocumentService.updateDocumentStatus(selectedDocumentId, 'rejected', rejectionReason.trim());
      
      // Update local state
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === selectedDocumentId 
            ? { ...doc, status: 'rejected', rejectionReason: rejectionReason.trim() }
            : doc
        )
      );
      
      toast({
        title: "Başarılı",
        description: "Döküman başarıyla reddedildi.",
      });
      
      // Reset dialog state
      setIsRejectDialogOpen(false);
      setSelectedDocumentId("");
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast({
        title: "Hata",
        description: "Döküman reddedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setProcessingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedDocumentId);
        return newSet;
      });
    }
  };

  const handleOpenRejectDialog = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

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
      if (!companyId) {
        setDocuments([]);
        setLoading(false);
        return;
      }
      try {
        const { data: companyDocs, error } = await supabase
          .from("company_documents")
          .select("*")
          .eq("companyId", companyId);

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
          uploadedAt: doc.uploadedAt || new Date().toISOString(),
          rejectionReason: doc.rejectionReason || null
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
  }, [companyId]);

  if (loading) return <div>Yükleniyor...</div>;
  
  return (
    <>
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {tDocTypes(documentTypeLabels[doc.type]) || doc.name}
                      </p>
                      {getStatusBadge(doc.status)}
                    </div>
                    {doc.status === 'rejected' && doc.rejectionReason && (
                      <div className="flex items-start gap-2 mt-2 text-sm text-red-600">
                        <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{doc.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Approve/Reject buttons - only show for pending documents */}
                  {doc.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveDocument(doc.id)}
                        disabled={processingDocuments.has(doc.id)}
                        className="text-green-700 border-green-300 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Onayla
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRejectDialog(doc.id)}
                        disabled={processingDocuments.has(doc.id)}
                        className="text-red-700 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reddet
                      </Button>
                    </>
                  )}
                  
                  {/* Download button */}
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
                  <ChevronRight className="w-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dokümanı Reddet</DialogTitle>
            <DialogDescription>
              Bu dokümanı reddetmek için lütfen bir açıklama girin. Bu açıklama şirkete bildirilecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Reddetme Sebebi</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Dokümanın neden reddedildiğini açıklayın..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-20"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
                disabled={processingDocuments.has(selectedDocumentId)}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectDocument}
                disabled={!rejectionReason.trim() || processingDocuments.has(selectedDocumentId)}
              >
                {processingDocuments.has(selectedDocumentId) ? "Reddediliyor..." : "Reddet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}