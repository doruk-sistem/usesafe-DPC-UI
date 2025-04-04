"use client";

import {
  Eye,
  MoreHorizontal,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
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
import { documentsApiHooks } from "@/lib/hooks/use-documents";
import type { Document } from "@/lib/types/document";

export function DocumentList() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const manufacturerId = searchParams.get("manufacturer");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [documentRejectDialogOpen, setDocumentRejectDialogOpen] = useState<boolean>(false);
  const [documentRejectReason, setDocumentRejectReason] = useState<string>("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");

  const { data: documents = [], isLoading, error } = documentsApiHooks.useGetDocuments();
  const { data: allProducts = [], isLoading: isLoadingProducts } = documentsApiHooks.useGetProducts();
  const { mutate: updateDocumentStatus } = documentsApiHooks.useUpdateDocumentStatus();
  const { mutate: updateDocumentStatusDirect } = documentsApiHooks.useUpdateDocumentStatusDirect();
  const { mutate: rejectProduct } = documentsApiHooks.useRejectProduct();
  
  console.log("DEBUG: Documents API Response:", { 
    documentCount: documents.length,
    isLoading, 
    error 
  });
  console.log("DEBUG: Products API Response:", { 
    productCount: allProducts.length, 
    isLoadingProducts 
  });

  console.log("DEBUG: Manufacturer ID from URL:", manufacturerId);
  console.log("DEBUG: Status filter:", statusFilter);

  const filteredDocuments = documents
    .filter((doc) =>
      manufacturerId ? doc.manufacturerId === manufacturerId : true
    )
    .filter((doc) =>
      statusFilter === "all" ? true : doc.status === statusFilter
    );
    
  console.log("DEBUG: Filtered Documents:", filteredDocuments.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    manufacturer: doc.manufacturer,
    manufacturerId: doc.manufacturerId,
    status: doc.status
  })));

  // Group documents by product
  const documentsByProduct = filteredDocuments.reduce<Record<string, Document[]>>((acc, doc) => {
    // Use productId for grouping
    const productId = doc.productId;
    console.log("DEBUG: Grouping document by product:", {
      documentId: doc.id,
      documentName: doc.name,
      productId: productId,
      manufacturerId: doc.manufacturerId
    });
    
    if (!acc[productId]) {
      acc[productId] = [];
    }
    // Check if this document is already in the array to avoid duplicates
    const isDuplicate = acc[productId].some(existingDoc => 
      existingDoc.id === doc.id && existingDoc.type === doc.type
    );
    if (!isDuplicate) {
      acc[productId].push(doc);
    } else {
      console.log("DEBUG: Skipping duplicate document:", {
        documentId: doc.id,
        documentName: doc.name,
        productId: productId
      });
    }
    return acc;
  }, {});

  // Add products with no documents
  allProducts.forEach(product => {
    if (!documentsByProduct[product.id]) {
      console.log("DEBUG: Adding product with no documents:", {
        productId: product.id,
        productName: product.name
      });
      documentsByProduct[product.id] = [];
    }
  });

  // Create a mapping of product IDs to product names for display
  const productNameMap = allProducts.reduce<Record<string, string>>((acc, product) => {
    acc[product.id] = product.name;
    return acc;
  }, {});

  const handleApprove = async (documentId: string) => {
    console.log("DEBUG: Approving document with ID:", documentId);
    console.log("DEBUG: All available documents:", documents);
    
    try {
      // Find the document in the filtered documents array
      console.log("DEBUG: Searching for document in filtered documents. Count:", filteredDocuments.length);
      const document = filteredDocuments.find(doc => {
        console.log("DEBUG: Comparing document:", {
          docId: doc.id,
          docName: doc.name,
          docType: doc.type,
          docManufacturerId: doc.manufacturerId,
          docManufacturer: doc.manufacturer,
          targetId: documentId
        });
        return doc.id === documentId;
      });

      if (!document) {
        console.error("DEBUG: Document not found in filtered documents. Document ID:", documentId);
        console.log("DEBUG: Available documents:", filteredDocuments.map(d => ({ 
          id: d.id, 
          name: d.name, 
          type: d.type,
          manufacturerId: d.manufacturerId,
          manufacturer: d.manufacturer
        })));
        return;
      }
      
      console.log("DEBUG: Found document to approve:", {
        id: document.id,
        name: document.name,
        type: document.type,
        manufacturerId: document.manufacturerId,
        manufacturer: document.manufacturer,
        status: document.status
      });
      
      // Doğrudan belge nesnesini kullanarak durumu güncelle
      await updateDocumentStatusDirect({
        document,
        status: "approved",
      });
      
      toast({
        title: "Success",
        description: "Document approved successfully",
      });
    } catch (error) {
      console.error("DEBUG: Error approving document:", error);
      toast({
        title: "Error",
        description: "Failed to approve document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (docId: string) => {
    console.log("DEBUG: Rejecting document with ID:", docId);
    setSelectedDocumentId(docId);
    setDocumentRejectDialogOpen(true);
  };

  const submitRejectDocument = async () => {
    if (!selectedDocumentId || !documentRejectReason) {
      console.error("DEBUG: Missing document ID or reject reason");
      return;
    }

    console.log("DEBUG: Rejecting document with ID:", selectedDocumentId);
    console.log("DEBUG: Reject reason:", documentRejectReason);
    console.log("DEBUG: All available documents:", documents);
    
    try {
      // Find the document in the filtered documents array
      console.log("DEBUG: Searching for document in filtered documents. Count:", filteredDocuments.length);
      const document = filteredDocuments.find(doc => {
        console.log("DEBUG: Comparing document:", {
          docId: doc.id,
          docName: doc.name,
          docType: doc.type,
          docManufacturerId: doc.manufacturerId,
          docManufacturer: doc.manufacturer,
          targetId: selectedDocumentId
        });
        return doc.id === selectedDocumentId;
      });

      if (!document) {
        console.error("DEBUG: Document not found in filtered documents. Document ID:", selectedDocumentId);
        console.log("DEBUG: Available documents:", filteredDocuments.map(d => ({ 
          id: d.id, 
          name: d.name, 
          type: d.type,
          manufacturerId: d.manufacturerId,
          manufacturer: d.manufacturer
        })));
        return;
      }
      
      console.log("DEBUG: Found document to reject:", {
        id: document.id,
        name: document.name,
        type: document.type,
        manufacturerId: document.manufacturerId,
        manufacturer: document.manufacturer,
        status: document.status
      });
      
      // Reddetme nedeni ve tarihini ekle
      const updatedDocument = {
        ...document,
        rejection_reason: documentRejectReason,
        rejection_date: new Date().toISOString()
      };
      
      // Doğrudan belge nesnesini kullanarak durumu güncelle
      await updateDocumentStatusDirect({
        document: updatedDocument,
        status: "rejected",
      });
      
      toast({
        title: "Success",
        description: "Document rejected successfully",
      });
      setDocumentRejectReason("");
      setSelectedDocumentId(null);
      setDocumentRejectDialogOpen(false);
    } catch (error) {
      console.error("DEBUG: Error rejecting document:", error);
      toast({
        title: "Error",
        description: "Failed to reject document. Please try again.",
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
      console.error("DEBUG: Missing product ID or reject reason");
      return;
    }

    console.log("DEBUG: Rejecting product with ID:", selectedProductId);
    console.log("DEBUG: Reject reason:", rejectReason);
    
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
      setSelectedProductId(null);
    } catch (error) {
      console.error("DEBUG: Error rejecting product:", error);
      toast({
        title: "Error",
        description: "Failed to reject product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: Document["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: Document["status"]) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "expired":
        return "destructive";
      default:
        return "warning";
    }
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  if (isLoading || isLoadingProducts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Repository</CardTitle>
          <CardDescription>Loading documents...</CardDescription>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="w-48 h-4 bg-gray-200 animate-pulse" />
                <div className="w-36 h-4 bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Document Repository</CardTitle>
            <CardDescription>
              View and manage all uploaded documents
            </CardDescription>
          </div>
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
      </CardHeader>
      <CardContent>
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Documents Found</h2>
            <p className="text-muted-foreground mb-4">
              {documents.length === 0 
                ? "No documents have been uploaded yet."
                : "No documents match the current filter criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(documentsByProduct).map(([productId, productDocs]) => {
              const isExpanded = expandedProducts[productId] || false;
              const productName = productNameMap[productId] || "Unknown Product";
              const documentCount = productDocs.length;
              
              return (
                <div key={productId} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer"
                    onClick={() => toggleProductExpansion(productId)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <h3 className="font-medium">{productName}</h3>
                      <Badge variant="outline">{documentCount} {documentCount === 1 ? 'document' : 'documents'}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {productDocs.length > 0 ? (
                        <>
                          {productDocs.some(doc => doc.status === "pending") && (
                            <Badge variant="warning">Pending Review</Badge>
                          )}
                          {productDocs.every(doc => doc.status === "approved") && (
                            <Badge variant="success">All Approved</Badge>
                          )}
                          {productDocs.some(doc => doc.status === "rejected") && (
                            <Badge variant="destructive">Has Rejected Documents</Badge>
                          )}
                          {!productDocs.some(doc => doc.status === "pending") && 
                           !productDocs.every(doc => doc.status === "approved") && 
                           !productDocs.some(doc => doc.status === "rejected") && (
                            <Badge variant="outline">Other Status</Badge>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline">No Documents</Badge>
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    productDocs.length > 0 ? (
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
                                        <TooltipContent side="top" align="start">
                                          <p className="max-w-[300px] break-words text-xs">{doc.name}</p>
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
                                        return String(doc.status).toUpperCase();
                                    }
                                  })()}
                                </Badge>
                                {doc.status === "rejected" && doc.rejection_reason && (
                                  <div className="mt-1 text-xs text-red-500">
                                    Reason: {doc.rejection_reason}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {doc.validUntil ? new Date(doc.validUntil).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell>v{doc.version}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                      <Link href={`/admin/documents/${doc.id}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(doc.url, '_blank')}>Download</DropdownMenuItem>
                                    <DropdownMenuItem>View History</DropdownMenuItem>
                                    {doc.status === "pending" && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-green-600"
                                          onClick={() => handleApprove(doc.id)}
                                        >
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="text-red-600"
                                          onClick={() => handleReject(doc.id)}
                                        >
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
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground mb-4">
                          No documents available for this product.
                        </p>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRejectProduct(productId)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Product
                        </Button>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this product due to missing documents.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="col-span-3"
                placeholder="Enter the reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitRejectProduct}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={documentRejectDialogOpen} onOpenChange={setDocumentRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="documentReason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="documentReason"
                value={documentRejectReason}
                onChange={(e) => setDocumentRejectReason(e.target.value)}
                className="col-span-3"
                placeholder="Enter the reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocumentRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitRejectDocument}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
  