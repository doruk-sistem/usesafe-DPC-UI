"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Package,
  CheckCircle,
  XCircle,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { documentsApiHooks } from "@/lib/hooks/use-documents";
import { useProduct } from "@/lib/hooks/use-product";
import { Document } from "@/lib/types/document";
import { formatDocumentType } from "@/lib/utils";
import { getStatusIcon, getStatusColor } from "@/lib/utils/document-utils";

interface ProductDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

// Container Component
function ProductDetailsContainer({ params }: ProductDetailsProps) {
  const { id } = use(params);
  const { isLoading: isAuthLoading } = useAuth();
  const { product, isLoading: isProductLoading, error, documentCount, allDocuments } = useProduct(id);

  const isLoading = isAuthLoading || isProductLoading;

  return (
    <ProductDetailsView
      product={product}
      productId={id}
      isLoading={isLoading}
      error={error}
      documentCount={documentCount}
      allDocuments={allDocuments}
    />
  );
}

// View Component
interface ProductDetailsViewProps {
  product: any;
  productId: string;
  isLoading: boolean;
  error: any;
  documentCount: number;
  allDocuments: Document[];
}

function ProductDetailsView({ product, productId, isLoading, error, documentCount, allDocuments }: ProductDetailsViewProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Document management state
  const [showDocuments, setShowDocuments] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [processingDocuments, setProcessingDocuments] = useState<Set<string>>(new Set());

  // Document hooks
  const { mutate: approveDocument } = documentsApiHooks.useApproveDocument();
  const { mutate: rejectDocument } = documentsApiHooks.useRejectDocument();

  const handleApproveDocument = async (documentId: string) => {
    if (!documentId) return;
    
    setProcessingDocuments(prev => new Set(prev).add(documentId));
    
    try {
      approveDocument({ documentId }, {
        onSuccess: () => {
          // Invalidate product documents cache to trigger UI update
          queryClient.invalidateQueries({ queryKey: ["product-documents", productId] });
          queryClient.invalidateQueries({ queryKey: ["product", productId] });
          
          toast({
            title: t("common.success"),
            description: "Document approved successfully",
          });
        },
        onError: (error: any) => {
          console.error("Error approving document:", error);
          toast({
            title: t("common.error"),
            description: "Failed to approve document. Please try again.",
            variant: "destructive",
          });
        },
        onSettled: () => {
          setProcessingDocuments(prev => {
            const newSet = new Set(prev);
            newSet.delete(documentId);
            return newSet;
          });
        }
      });
    } catch (error) {
      console.error("Error approving document:", error);
      setProcessingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const handleRejectDocument = async () => {
    if (!selectedDocumentId || !rejectReason.trim()) {
      toast({
        title: t("common.error"),
        description: "Please provide a rejection reason.",
        variant: "destructive",
      });
      return;
    }
    
    setProcessingDocuments(prev => new Set(prev).add(selectedDocumentId));
    
    try {
      rejectDocument({ 
        documentId: selectedDocumentId, 
        reason: rejectReason.trim() 
      }, {
        onSuccess: () => {
          // Invalidate product documents cache to trigger UI update
          queryClient.invalidateQueries({ queryKey: ["product-documents", productId] });
          queryClient.invalidateQueries({ queryKey: ["product", productId] });
          
          toast({
            title: t("common.success"),
            description: "Document rejected successfully",
          });
          setRejectDialogOpen(false);
          setSelectedDocumentId("");
          setRejectReason("");
        },
        onError: (error: any) => {
          console.error("Error rejecting document:", error);
          toast({
            title: t("common.error"),
            description: "Failed to reject document. Please try again.",
            variant: "destructive",
          });
        },
        onSettled: () => {
          setProcessingDocuments(prev => {
            const newSet = new Set(prev);
            newSet.delete(selectedDocumentId);
            return newSet;
          });
        }
      });
    } catch (error) {
      console.error("Error rejecting document:", error);
      setProcessingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedDocumentId);
        return newSet;
      });
    }
  };

  const handleOpenRejectDialog = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleDownloadDocument = (document: Document) => {
    if (document.url) {
      window.open(document.url, "_blank");
    } else {
      toast({
        title: t("common.error"),
        description: "Document URL not available",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">
          {t("admin.products.errors.notFound")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {error?.message || t("admin.products.errors.notFoundDescription")}
        </p>
        <Button asChild>
          <Link href="/admin/products">{t("common.buttons.back")}</Link>
        </Button>
      </div>
    );
  }

  const productData = product;

  try {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">
                {t("admin.products.details.backButton")}
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">{productData.name}</h1>
            <Badge variant="outline">{productData.product_type}</Badge>
          </div>
        </div>

        {/* Product Information - Top Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("admin.products.details.productInfo.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.products.details.productInfo.id")}
                </p>
                <p className="font-medium">{productData.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.products.details.productInfo.manufacturer")}
                </p>
                <p className="font-medium">
                  {productData.manufacturer?.name || productData.manufacturer_id || t("common.labels.notAvailable")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.products.details.productInfo.type")}
                </p>
                <p className="font-medium">{productData.product_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.products.details.productInfo.status")}
                </p>
                <div className="font-medium">
                  {productData.status ? (
                    <Badge variant="outline" className="capitalize">
                      {productData.status}
                    </Badge>
                  ) : (
                    t("common.labels.notAvailable")
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.products.details.productInfo.created")}
                </p>
                <p className="font-medium">
                  {new Date(productData.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {productData.description && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">
                  {t("admin.products.details.productInfo.description")}
                </p>
                <p className="mt-1">{productData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents - Bottom Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("admin.products.details.documents.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("admin.products.details.documents.totalDocuments")}
                </p>
                <p className="font-medium">{documentCount}</p>
              </div>
              
              {allDocuments.length > 0 && (
                <Collapsible open={showDocuments} onOpenChange={setShowDocuments}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t("admin.products.details.documents.description")}
                    </p>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {showDocuments ? (
                          <>
                            Hide Documents
                            <ChevronUp className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            View Documents
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent className="space-y-2 pt-2">
                    {allDocuments.map((doc, index) => (
                      <div
                        key={`${doc.id || "doc"}-${doc.name}-${doc.type || "unknown"}-${index}`}
                        className="flex items-center justify-between rounded-lg border p-4 space-x-4"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getStatusIcon(doc.status)}
                          <div className="flex-1">
                            <p className="font-medium">{formatDocumentType(doc.originalType || '')}</p>
                            {doc.status === "rejected" && doc.rejection_reason && (
                              <p className="text-sm text-red-500 mt-1">
                                Reason: {doc.rejection_reason}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={getStatusColor(doc.status)}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Download button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          {/* Approve/Reject buttons - only show for pending documents */}
                          {doc.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveDocument(doc.id)}
                                disabled={processingDocuments.has(doc.id)}
                                className="text-green-700 border-green-300 hover:bg-green-50 h-8 w-8 p-0"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenRejectDialog(doc.id)}
                                disabled={processingDocuments.has(doc.id)}
                                className="text-red-700 border-red-300 hover:bg-red-50 h-8 w-8 p-0"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reject Document Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Document</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this document. This will be communicated to the company.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Explain why the document is being rejected..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-20"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                disabled={processingDocuments.has(selectedDocumentId)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectDocument}
                disabled={!rejectReason.trim() || processingDocuments.has(selectedDocumentId)}
              >
                {processingDocuments.has(selectedDocumentId) ? "Rejecting..." : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  } catch (error) {
    console.error("Error rendering product details:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">
          {t("common.errors.title")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("common.errors.unexpectedError")}
        </p>
        <Button asChild>
          <Link href="/admin/products">{t("common.buttons.back")}</Link>
        </Button>
      </div>
    );
  }
}

// Default export
export default function ProductDetailsPage({ params }: ProductDetailsProps) {
  return <ProductDetailsContainer params={params} />;
}
