"use client";

import {
  Eye,
  MoreHorizontal,
  FileText,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { documentsApiHooks } from "@/lib/hooks/use-documents";
import { useProducts } from "@/lib/hooks/use-products";
import { Document, DocumentStatus } from "@/lib/types/document";
import { getStatusIcon } from "@/lib/utils/document-utils";

interface DocumentListProps {
  initialDocuments?: Document[];
  filters?: {
    type: string;
    status: string;
  };
  manufacturerId?: string;
}

export function DocumentList({ initialDocuments = [], filters, manufacturerId }: DocumentListProps) {
  const t = useTranslations("documentManagement");
  const { toast } = useToast();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedProducts, setExpandedProducts] = useState<
    Record<string, boolean>
  >({});
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [documentRejectDialogOpen, setDocumentRejectDialogOpen] =
    useState<boolean>(false);
  const [documentRejectReason, setDocumentRejectReason] = useState<string>("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [localDocuments, setLocalDocuments] = useState<Document[]>(initialDocuments);

  const documentTypeLabels: Record<string, string> = {
    quality_cert: "Quality Certificate",
    safety_cert: "Safety Certificate",
    test_reports: "Test Reports",
    technical_docs: "Technical Documentation",
    compliance_docs: "Compliance Documents",
    certificates: "Certificates",
    other: "Other"
  };

  // Helper function to get document type label
  const getDocumentTypeLabel = (doc: Document) => {
    // Eğer originalType varsa (AI'dan gelen), onu göster
    if (doc.originalType) {
      return doc.originalType;
    }
    
    // Standart türler için label kullan
    return documentTypeLabels[doc.type] || doc.type;
  };

  const {
    data: documents = [],
    isLoading,
    error,
  } = documentsApiHooks.useGetDocuments();
  const { products: allProducts = [], isLoading: isLoadingProducts, rejectProduct } = useProducts();
  const { mutate: updateDocumentStatus } =
    documentsApiHooks.useUpdateDocumentStatus();
  const { mutate: updateDocumentStatusDirect } =
    documentsApiHooks.useUpdateDocumentStatusDirect();
  const { mutate: rejectDocument } = documentsApiHooks.useRejectDocument();

  // Update local documents when initialDocuments or documents changes
  useEffect(() => {
    if (initialDocuments && initialDocuments.length > 0) {
      setLocalDocuments(initialDocuments);
    } else if (documents && documents.length > 0) {
      setLocalDocuments(documents);
    }
  }, [documents, initialDocuments]);

  // Use local documents for filtering
  const filteredDocuments = localDocuments
    .filter((doc) =>
      manufacturerId ? doc.manufacturerId === manufacturerId : true
    )
    .filter((doc) =>
      filters?.type === "all" ? true : doc.type === filters?.type
    )
    .filter((doc) =>
      filters?.status === "all-status" ? true : doc.status === filters?.status
    );

  // Group documents by product from documents table
  const documentsByProduct = filteredDocuments.reduce<
    Record<string, Document[]>
  >((acc, doc) => {
    const productId = doc.productId;

    if (productId) {
      if (!acc[productId]) {
        acc[productId] = [];
      }
      const isDuplicate = acc[productId].some(
        (existingDoc) =>
          existingDoc.id === doc.id && existingDoc.type === doc.type
      );
      if (!isDuplicate) {
        acc[productId].push(doc);
      }
    }
    return acc;
  }, {});

  // Add products with no documents
  allProducts.forEach((product) => {
    if (product.id && !documentsByProduct[product.id]) {
      documentsByProduct[product.id] = [];
    }
  });

  // Create a mapping of product IDs to product names for display
  const productNameMap = allProducts.reduce<Record<string, string>>(
    (acc, product) => {
      if (product.id) {
        acc[product.id] = product.name;
      }
      return acc;
    },
    {}
  );

  const handleApprove = async (documentId: string) => {
    try {
      const document = filteredDocuments.find((doc) => doc.id === documentId);

      if (!document) {
        return;
      }

      await updateDocumentStatusDirect({
        document,
        status: DocumentStatus.APPROVED,
      });

      // Update local document status
      setLocalDocuments((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === documentId ? { ...doc, status: DocumentStatus.APPROVED } : doc
        )
      );

      toast({
        title: "Success",
        description: "Document approved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (docId: string) => {
    setSelectedDocumentId(docId);
    setDocumentRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    try {
      const document = filteredDocuments.find(
        (doc) => doc.id === selectedDocumentId
      );

      if (!document) {
        return;
      }

      await rejectDocument({
        documentId: selectedDocumentId,
        reason: documentRejectReason,
      });

      // Yerel belge durumunu güncelle
      setLocalDocuments((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === selectedDocumentId
            ? {
                ...doc,
                status: DocumentStatus.REJECTED,
                rejection_reason: documentRejectReason,
              }
            : doc
        )
      );

      setDocumentRejectDialogOpen(false);
      setDocumentRejectReason("");

      toast({
        title: "Başarılı",
        description: "Belge başarıyla reddedildi",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Belge reddedilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  const handleRejectProduct = async (productId: string) => {
    setSelectedProductId(productId);
    setRejectDialogOpen(true);
  };

  const submitRejectProduct = async () => {
    if (!selectedProductId || !rejectReason) {
      return;
    }

    try {
      await rejectProduct({
        productId: selectedProductId,
        reason: rejectReason,
      });

      toast({
        title: "Success",
        description: "Product rejected successfully",
      });
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedProductId("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (document: Document) => {
    if (document.url) {
      window.open(document.url, "_blank");
    } else {
      toast({
        title: "Error",
        description: "Document URL not available",
        variant: "destructive",
      });
    }
  };

  const getStatusVariant = (status: Document["status"]) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "expired":
        return "warning";
      default:
        return "default";
    }
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Show loading state only if we don't have initial documents
  if ((isLoading || isLoadingProducts) && (!initialDocuments || initialDocuments.length === 0)) {
    return <Loading />;
  }

  // Show error only if we don't have initial documents
  if (error && (!initialDocuments || initialDocuments.length === 0)) {
    return <div>Error loading documents</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {/* <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription> */}
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Documents Found</h2>
            <p className="text-muted-foreground mb-4">
              {localDocuments.length === 0
                ? "No documents have been uploaded yet."
                : "No documents match the current filter criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(documentsByProduct)
              .filter(([productId, productDocs]) => productNameMap[productId] && productNameMap[productId] !== "Unknown Product")
              .map(
                ([productId, productDocs]) => {
                  const isExpanded = expandedProducts[productId] || false;
                  const productName = productNameMap[productId] || "Unknown Product";
                  const documentCount = productDocs.length;

                  return (
                    <div
                      key={productId}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div
                        className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer"
                        onClick={() => toggleProductExpansion(productId)}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <h3 className="font-medium">{productName}</h3>
                          <Badge variant="outline">
                            {documentCount}{" "}
                            {documentCount === 1 ? "document" : "documents"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {productDocs.length > 0 ? (
                            <>
                              {productDocs.some(
                                (doc) => doc.status === "pending"
                              ) && (
                                <Badge variant="warning">Pending Review</Badge>
                              )}
                              {productDocs.every(
                                (doc) => doc.status === "approved"
                              ) && <Badge variant="success">All Approved</Badge>}
                              {productDocs.some(
                                (doc) => doc.status === "rejected"
                              ) && (
                                <Badge variant="destructive">
                                  Has Rejected Documents
                                </Badge>
                              )}
                              {!productDocs.some(
                                (doc) => doc.status === "pending"
                              ) &&
                                !productDocs.every(
                                  (doc) => doc.status === "approved"
                                ) &&
                                !productDocs.some(
                                  (doc) => doc.status === "rejected"
                                ) && (
                                  <Badge variant="outline">Other Status</Badge>
                                )}
                            </>
                          ) : (
                            <Badge variant="outline">No Documents</Badge>
                          )}
                        </div>
                      </div>

                      {isExpanded &&
                        (productDocs.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Document</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Valid Until</TableHead>
                                <TableHead>Version</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {productDocs.map((doc) => (
                                <TableRow key={`${doc.id}-${doc.type}`}>
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
                                            <TooltipContent
                                              side="top"
                                              align="start"
                                            >
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
                                  <TableCell>{getDocumentTypeLabel(doc)}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={getStatusVariant(doc.status)}
                                      className="flex w-fit items-center gap-1"
                                    >
                                      {getStatusIcon(doc.status)}
                                      {(() => {
                                        switch (doc.status) {
                                          case "rejected":
                                            return "REJECTED";
                                          case "pending":
                                            return "PENDING";
                                          case "approved":
                                            return "APPROVED";
                                          case "expired":
                                            return "EXPIRED";
                                          default:
                                            return String(
                                              doc.status
                                            ).toUpperCase();
                                        }
                                      })()}
                                    </Badge>
                                    {doc.status === "rejected" &&
                                      doc.rejection_reason && (
                                        <div className="mt-1 text-xs text-red-500">
                                          Reason: {doc.rejection_reason}
                                        </div>
                                      )}
                                  </TableCell>
                                  <TableCell>
                                    {doc.validUntil
                                      ? new Date(
                                          doc.validUntil
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell>v{doc.version}</TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">
                                            Open menu
                                          </span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>
                                          Actions
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                          <Link
                                            href={`/admin/documents/${doc.id}`}
                                          >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                          </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDownload(doc)}
                                        >
                                          <Download className="mr-2 h-4 w-4" />
                                          Download
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          View History
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {doc.status === "pending" && (
                                          <>
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleApprove(doc.id)
                                              }
                                            >
                                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                              Approve
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => handleReject(doc.id)}
                                            >
                                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                              Reject
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            No documents available for this product
                          </div>
                        ))}
                    </div>
                  );
                }
              )}
          </div>
        )}
      </CardContent>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitRejectProduct}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={documentRejectDialogOpen}
        onOpenChange={setDocumentRejectDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason</Label>

              <Textarea
                id="reject-reason"
                placeholder="Enter the reason for rejection..."
                value={documentRejectReason}
                onChange={(e) => setDocumentRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDocumentRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
