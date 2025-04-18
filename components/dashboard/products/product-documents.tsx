"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Download,
  FileText,
  Eye,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateDocumentStatus } from "@/lib/hooks/use-documents";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProductDocumentsProps {
  productId: string;
  showApprovalOptions?: boolean;
}

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  status: "approved" | "pending" | "rejected" | "expired";
  validUntil?: string;
  version: string;
  uploadedAt: string;
  fileSize: string;
  rejection_reason?: string;
}

interface Product {
  name: string;
  status: "DRAFT" | "NEW" | "DELETED" | "ARCHIVED";
  documents: Record<string, Document[]>;
}

const documentTypeLabels: Record<string, string> = {
  quality_cert: "Quality Certificate",
  safety_cert: "Safety Certificate",
  test_reports: "Test Reports",
  technical_docs: "Technical Documentation",
  compliance_docs: "Compliance Documents",
};

export function ProductDocuments({
  productId,
  showApprovalOptions = false,
}: ProductDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  useEffect(() => {}, [showApprovalOptions]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("name, status, documents")
          .eq("id", productId)
          .single();

        if (error) throw error;

        setProduct(data);

        // Flatten all document arrays into a single array
        const allDocuments: Document[] = [];
        if (data?.documents) {
          Object.entries(data.documents).forEach(([type, docs]) => {
            if (Array.isArray(docs)) {
              docs.forEach((doc) => {
                allDocuments.push({
                  id:
                    doc.id ||
                    `doc-${Date.now()}-${Math.random()
                      .toString(36)
                      .substr(2, 9)}`,
                  name: doc.name,
                  url: doc.url,
                  type: type,
                  status: doc.status || "pending",
                  validUntil: doc.validUntil,
                  version: doc.version || "1.0",
                  uploadedAt: doc.uploadedAt || new Date().toISOString(),
                  fileSize: doc.fileSize || "N/A",
                  rejection_reason: doc.rejection_reason,
                });
              });
            }
          });
        }
        setDocuments(allDocuments);
      } catch (error) {
        console.error("Error fetching product documents:", error);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId, supabase, toast]);

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleView = (doc: Document) => {
    // Open document in a new tab
    window.open(doc.url, "_blank");
  };

  const handleViewHistory = (doc: Document) => {
    // Check if document has a valid ID
    if (!doc.id) {
      toast({
        title: "Error",
        description: "Document ID is missing",
        variant: "destructive",
      });
      return;
    }

    // Navigate to document history page
    window.location.href = `/dashboard/documents/${doc.id}/history`;
  };

  const handleReupload = (doc: Document) => {
    // Navigate to the product edit page with a query parameter to indicate re-upload
    window.location.href = `/dashboard/products/${productId}/edit?reupload=${doc.id}`;
  };

  const handleApproveDocument = async (doc: Document) => {
    try {
      // Doğrudan Supabase'e güncelleme yap
      const supabase = createClientComponentClient();

      // Önce ürünü al
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;
      if (!product) throw new Error("Product not found");

      // Belgeleri güncelle
      const updatedDocuments = { ...product.documents };
      let documentFound = false;

      // Belge tipine göre arama yap
      if (doc.type && updatedDocuments[doc.type]) {
        const documentArray = updatedDocuments[doc.type];

        // Belge adına göre eşleştir
        const documentIndex = documentArray.findIndex(
          (d: any) => d.name === doc.name
        );

        if (documentIndex !== -1) {
          // Belgeyi güncelle
          updatedDocuments[doc.type][documentIndex] = {
            ...updatedDocuments[doc.type][documentIndex],
            status: "approved",
            updatedAt: new Date().toISOString(),
          };
          documentFound = true;
        }
      }

      if (!documentFound) {
        throw new Error(`Document with name ${doc.name} not found in product`);
      }

      // Ürünü güncelle
      const { error: updateError } = await supabase
        .from("products")
        .update({ documents: updatedDocuments })
        .eq("id", productId);

      if (updateError) throw updateError;

      // Update local state
      setDocuments(
        documents.map((d) => {
          if (d.id === doc.id) {
            return { ...d, status: "approved" };
          }
          return d;
        })
      );

      // Invalidate the product query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["product", productId] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast({
        title: "Başarılı",
        description: "Belge onaylandı",
      });
    } catch (error) {
      console.error("Error approving document:", error);
      toast({
        title: "Hata",
        description:
          "Belge onaylanırken bir hata oluştu: " +
          (error instanceof Error ? error.message : JSON.stringify(error)),
        variant: "destructive",
      });
    }
  };

  const handleRejectDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedDocument) return;

    try {
      // Doğrudan Supabase'e güncelleme yap
      const supabase = createClientComponentClient();

      // Önce ürünü al
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;
      if (!product) throw new Error("Product not found");

      // Belgeleri güncelle
      const updatedDocuments = { ...product.documents };
      let documentFound = false;

      // Belge tipine göre arama yap
      if (selectedDocument.type && updatedDocuments[selectedDocument.type]) {
        const documentArray = updatedDocuments[selectedDocument.type];

        // Belge adına göre eşleştir
        const documentIndex = documentArray.findIndex(
          (d: any) => d.name === selectedDocument.name
        );

        if (documentIndex !== -1) {
          // Belgeyi güncelle
          updatedDocuments[selectedDocument.type][documentIndex] = {
            ...updatedDocuments[selectedDocument.type][documentIndex],
            status: "rejected",
            rejection_reason: rejectionReason,
            rejected_at: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          documentFound = true;
        }
      }

      if (!documentFound) {
        throw new Error(
          `Document with name ${selectedDocument.name} not found in product`
        );
      }

      // Ürünü güncelle
      const { error: updateError } = await supabase
        .from("products")
        .update({ documents: updatedDocuments })
        .eq("id", productId);

      if (updateError) throw updateError;

      // Update local state
      setDocuments(
        documents.map((d) => {
          if (d.id === selectedDocument.id) {
            return {
              ...d,
              status: "rejected",
              rejection_reason: rejectionReason,
              rejected_at: new Date().toISOString(),
            };
          }
          return d;
        })
      );

      // Invalidate the product query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["product", productId] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast({
        title: "Başarılı",
        description: "Belge reddedildi",
      });

      setShowRejectDialog(false);
      setSelectedDocument(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast({
        title: "Hata",
        description:
          "Belge reddedilirken bir hata oluştu: " +
          (error instanceof Error ? error.message : JSON.stringify(error)),
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ARCHIVED":
        return "approved";
      case "DELETED":
        return "rejected";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ARCHIVED":
        return "success";
      case "DELETED":
        return "destructive";
      case "NEW":
        return "success";
      case "DRAFT":
        return "warning";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-md" />
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-gray-200 animate-pulse" />
                  <div className="w-36 h-4 bg-gray-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground">
            The requested product could not be found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Product Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{product.name}</h3>
            <Badge variant={getStatusVariant(product.status)}>
              {getStatusDisplay(product.status).toLowerCase()}
            </Badge>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
              <p className="text-muted-foreground">
                This product has no documents attached.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="w-[100px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="font-medium truncate max-w-[200px]">
                                  {document.name.length > 25
                                    ? `${document.name.slice(0, 25)}...`
                                    : document.name}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="start">
                                <p className="max-w-[300px] break-words text-xs">
                                  {document.name}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <p className="text-sm text-muted-foreground">
                            {document.id} · {document.fileSize}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {documentTypeLabels[document.type] || document.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(document.status)}
                        className="flex w-fit items-center gap-1"
                      >
                        {getStatusIcon(document.status)}
                        {document.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {document.validUntil
                        ? new Date(document.validUntil).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>v{document.version}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDownload(document)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleView(document)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewHistory(document)}
                          >
                            <History className="h-4 w-4 mr-2" />
                            View History
                          </DropdownMenuItem>
                          {showApprovalOptions && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleApproveDocument(document)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                Onayla
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRejectDocument(document)}
                              >
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                Reddet
                              </DropdownMenuItem>
                            </>
                          )}
                          {showApprovalOptions &&
                            document.status === "rejected" && (
                              <DropdownMenuItem
                                onClick={() => handleReupload(document)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Yeniden Yükle
                              </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showApprovalOptions && (
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Belgeyi Reddet</DialogTitle>
              <DialogDescription>
                Lütfen reddetme sebebini belirtin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="rejection-reason">Reddetme Sebebi</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reddetme sebebini girin..."
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
              >
                İptal
              </Button>
              <Button variant="destructive" onClick={handleRejectConfirm}>
                Reddet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
