"use client";

import { FileText, MoreHorizontal, Download, History, ExternalLink, CheckCircle, XCircle, ChevronDown, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { supabase } from "@/lib/supabase/client";
import { getStatusIcon } from "../../../lib/utils/document-utils";
import { useAuth } from "@/lib/hooks/use-auth";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  status: string;
  validUntil: string | null;
  uploadedAt: string;
  fileSize: string;
  issuer: string;
  rejectionReason?: string;
  product_id: string;
  product_name: string;
  url?: string;
  version?: string;
}

export function DocumentList() {
  const t = useTranslations();
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");

  useEffect(() => {
    async function fetchDocuments() {
      if (!user?.user_metadata?.company_id) {
        console.log("No company ID found in user metadata");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("company_id", user.user_metadata.company_id);

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        if (data) {
          const allDocs: Document[] = [];
          data.forEach(product => {
            if (product.documents) {
              Object.values(product.documents).forEach((docsArr) => {
                if (Array.isArray(docsArr)) {
                  docsArr.forEach((doc, index) => {
                    const normalizedDoc = {
                      id: doc.id ? String(doc.id) : `doc-${product.id}-${doc.type || 'unknown'}-${index}`,
                      name: doc.name || 'Unnamed Document',
                      type: doc.type || 'unknown',
                      category: doc.category || doc.type || 'unknown',
                      status: doc.status || 'pending',
                      validUntil: doc.validUntil || null,
                      uploadedAt: doc.uploadedAt || doc.updatedAt || new Date().toISOString(),
                      fileSize: doc.fileSize || '0 KB',
                      issuer: doc.issuer || '-',
                      rejectionReason: doc.rejection_reason || doc.rejectionReason,
                      product_id: product.id,
                      product_name: product.name || product.product_name || '-',
                      url: doc.url || doc.file_url || null,
                      version: doc.version || '1.0'
                    };
                    allDocs.push(normalizedDoc);
                  });
                }
              });
            }
          });

          console.log("All documents:", allDocs);
          setDocuments(allDocs);
        }
      } catch (error) {
        console.error("Error in fetchDocuments:", error);
        toast({
          title: "Error",
          description: "Failed to fetch documents",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [user, toast]);

  // Filter documents based on status
  const filteredDocuments = documents.filter((doc) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pending") return doc.status === "pending";
    if (statusFilter === "approved") return doc.status === "approved";
    if (statusFilter === "rejected") return doc.status === "rejected";
    if (statusFilter === "expired") return doc.status === "expired";
    return true;
  });

  // Group documents by product
  const documentsByProduct = filteredDocuments.reduce<Record<string, Document[]>>(
    (acc, doc) => {
      const productId = doc.product_id;
      if (productId) {
        if (!acc[productId]) {
          acc[productId] = [];
        }
        acc[productId].push(doc);
      }
      return acc;
    },
    {}
  );

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

  const getStatusVariant = (status: string) => {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("documents.repository.title")}</CardTitle>
            <CardDescription>
              {t("documents.repository.description")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={statusFilter} 
              onValueChange={(value) => {
                setStatusFilter(value);
                // Reset expanded products when filter changes
                setExpandedProducts({});
              }}
            >
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
              {documents.length === 0
                ? "No documents have been uploaded yet."
                : "No documents match the current filter criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(documentsByProduct).map(([productId, productDocs]) => {
              const isExpanded = expandedProducts[productId] || false;
              const productName = productDocs[0]?.product_name || "Unknown Product";
              const documentCount = productDocs.length;

              return (
                <div key={productId} className="border rounded-lg overflow-hidden">
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
                        {documentCount} {documentCount === 1 ? "document" : "documents"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {productDocs.some((doc) => doc.status === "pending") && (
                        <Badge variant="warning">Pending Review</Badge>
                      )}
                      {productDocs.every((doc) => doc.status === "approved") && (
                        <Badge variant="success">All Approved</Badge>
                      )}
                      {productDocs.some((doc) => doc.status === "rejected") && (
                        <Badge variant="destructive">Has Rejected Documents</Badge>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
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
                          <TableRow key={doc.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <p className="font-medium truncate max-w-[200px]">
                                          {doc.name && doc.name.length > 25
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
                            <TableCell>
                              <Badge
                                variant={getStatusVariant(doc.status)}
                                className="flex w-fit items-center gap-1"
                              >
                                {getStatusIcon(doc.status)}
                                {doc.status.toUpperCase()}
                              </Badge>
                              {doc.status === "rejected" && doc.rejectionReason && (
                                <div className="mt-1 text-xs text-red-500">
                                  Reason: {doc.rejectionReason}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {doc.validUntil
                                ? new Date(doc.validUntil).toLocaleDateString()
                                : "N/A"}
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
                                    <Link href={`/dashboard/documents/${doc.id}`}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  {doc.url && (
                                    <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                      <Download className="mr-2 h-4 w-4" />
                                      Download
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/documents/${doc.id}/history`}>
                                      <History className="h-4 w-4 mr-2" />
                                      View History
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}