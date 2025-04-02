"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Download, FileText, Eye, History, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface ProductDocumentsProps {
  productId: string;
}

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  validUntil?: string;
  version: string;
  uploadedAt: string;
  fileSize: string;
  rejectionReason?: string;
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
  compliance_docs: "Compliance Documents"
};

export function ProductDocuments({ productId }: ProductDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

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
              docs.forEach(doc => {
                allDocuments.push({
                  id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: doc.name,
                  url: doc.url,
                  type: type,
                  status: doc.status || "PENDING",
                  validUntil: doc.validUntil,
                  version: doc.version || "1.0",
                  uploadedAt: doc.uploadedAt || new Date().toISOString(),
                  fileSize: doc.fileSize || "N/A",
                  rejectionReason: doc.rejectionReason
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
  }, [productId, toast, supabase]);

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
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
    window.open(doc.url, '_blank');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "destructive";
      case "PENDING":
        return "warning";
      default:
        return "secondary";
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
    <Card>
      <CardHeader>
        <CardTitle>Product Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{product.name}</h3>
          <Badge
            variant={
              product.status === "NEW"
                ? "success"
                : product.status === "DRAFT"
                ? "warning"
                : "destructive"
            }
          >
            {product.status.toLowerCase()}
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
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{document.name}</TableCell>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDownload(document)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleView(document)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewHistory(document)}>
                          <History className="h-4 w-4 mr-2" />
                          View History
                        </DropdownMenuItem>
                        {document.status === "REJECTED" && (
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Re-upload
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
  );
} 