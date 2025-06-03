"use client";

import { useTranslations } from "next-intl";
import { DocumentService } from "@/lib/services/document";
import { useState, useEffect, use } from "react";
import { Document } from "@/lib/types/document";
import { Loading } from "@/components/ui/loading";
import { Error } from "@/components/ui/error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStatusIcon } from "@/lib/utils/document-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductDocuments } from "@/components/dashboard/products/product-documents";

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

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ManufacturerDocumentsPage({ params }: PageProps) {
  const t = useTranslations();
  const { id } = use(params);
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

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setIsLoading(true);
        const docs = await DocumentService.getDocumentsByManufacturer(id);
        setDocuments(docs);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, [id]);

  const filteredDocuments = documents.filter((doc) =>
    statusFilter === "all" ? true : doc.status === statusFilter
  );

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
          </h1>
          <p className="text-muted-foreground">
            {t("documentManagement.repository.description.forManufacturer")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("documentManagement.repository.statuses.all")}</SelectItem>
              <SelectItem value="pending">{t("documentManagement.repository.statuses.pending")}</SelectItem>
              <SelectItem value="approved">{t("documentManagement.repository.statuses.approved")}</SelectItem>
              <SelectItem value="rejected">{t("documentManagement.repository.statuses.rejected")}</SelectItem>
              <SelectItem value="expired">{t("documentManagement.repository.statuses.expired")}</SelectItem>
            </SelectContent>
          </Select>
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
                    <TableHead>{t("documentManagement.repository.type")}</TableHead>
                    <TableHead>{t("documentManagement.repository.status")}</TableHead>
                    <TableHead>{t("documentManagement.repository.validUntil")}</TableHead>
                    <TableHead>{t("documentManagement.repository.version")}</TableHead>
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
                                    {doc.name.length > 25
                                      ? `${doc.name.slice(0, 25)}...`
                                      : doc.name}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="start">
                                  <p className="max-w-[300px] break-words text-xs">
                                    {doc.name}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <p className="text-sm text-muted-foreground">
                              {doc.id} · {doc.fileSize}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell><Badge
  variant={
    doc.status === "approved"
      ? "success"
      : doc.status === "rejected"
      ? "destructive"
      : doc.status === "expired"
      ? "warning"
      : "default"
  }
  className="flex w-fit items-center gap-1"
>
  {getStatusIcon(doc.status || "pending")}
  {t(`documentManagement.status.${doc.status === "approved" ? "approved" : 
     doc.status === "rejected" ? "rejected" : 
     doc.status === "expired" ? "expired" : 
     "pending"}`)}
</Badge>
          
                      </TableCell>
                      <TableCell>
                        {doc.validUntil
                          ? new Date(doc.validUntil).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>v{doc.version}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(doc.url, "_blank")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
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
                  {getPaginationRange(currentPage, totalPages).map((page, idx) =>
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