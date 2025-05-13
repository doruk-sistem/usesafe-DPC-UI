"use client";

import React from "react";
import { FileText, ChevronDown, ChevronRight, Download, MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProducts } from "@/lib/hooks/use-products";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStatusIcon } from "../../../lib/utils/document-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DocumentList() {
  const t = useTranslations("documentManagement");
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const { products: allProducts = [] } = useProducts(user?.user_metadata?.company_id);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDocuments() {
      if (!user?.user_metadata?.company_id) return;
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("company_id", user.user_metadata.company_id);
      if (data) {
        // Her ürünün dökümanlarını productId ile ilişkilendir
        const allDocs: any[] = [];
        data.forEach(product => {
          if (product.documents) {
            Object.values(product.documents).forEach((docsArr) => {
              if (Array.isArray(docsArr)) {
                docsArr.forEach(doc => {
                  allDocs.push({
                    ...doc,
                    product_id: product.id,
                    product_name: product.name || product.product_name || "-"
                  });
                });
              }
            });
          }
        });
        setDocuments(allDocs);
      }
    }
    fetchDocuments();
  }, [user]);

  // Filtreleme
  const filteredDocuments = documents.filter((doc) =>
    statusFilter === "all" ? true : doc.status === statusFilter
  );

  // Ürünlere göre grupla
  const documentsByProduct = filteredDocuments.reduce<Record<string, any[]>>((acc, doc) => {
    const productId = doc.product_id;
    if (productId) {
      if (!acc[productId]) acc[productId] = [];
      acc[productId].push(doc);
    }
    return acc;
  }, {});

  // allProducts'tan ürün id -> ürün adı map'i oluştur
  const productNameMap = allProducts.reduce((acc: Record<string, string>, product: any) => {
    if (product.id) acc[product.id] = product.name || product.product_name;
    return acc;
  }, {});

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Admin panelindeki gibi status badge fonksiyonu
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "expired":
        return "warning";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
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
        {Object.keys(documentsByProduct).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Documents Found</h2>
            <p className="text-muted-foreground mb-4">
              No documents have been uploaded yet.
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
                      {productDocs.length > 0 ? (
                        <>
                          {productDocs.some((doc) => doc.status === "pending") && (
                            <Badge variant="warning">Pending Review</Badge>
                          )}
                          {productDocs.every((doc) => doc.status === "approved") && (
                            <Badge variant="success">All Approved</Badge>
                          )}
                          {productDocs.some((doc) => doc.status === "rejected") && (
                            <Badge variant="destructive">Has Rejected Documents</Badge>
                          )}
                          {!productDocs.some((doc) => doc.status === "pending") &&
                            !productDocs.every((doc) => doc.status === "approved") &&
                            !productDocs.some((doc) => doc.status === "rejected") && (
                              <Badge variant="warning">Pending Review</Badge>
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
                                            {doc.name && doc.name.length > 25 ? `${doc.name.slice(0, 25)}...` : doc.name}
                                          </p>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" align="start">
                                          <p className="max-w-[300px] break-words text-xs">{doc.name}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <p className="text-sm text-muted-foreground">
                                      {doc.id} {doc.fileSize ? `· ${doc.fileSize}` : ""}
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
                                  {getStatusIcon((doc.status || 'pending').toLowerCase())}
                                  {doc.status ? doc.status.toUpperCase() : 'PENDING'}
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
                                      <Link href={`/dashboard/documents/${doc.id}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(doc.url, "_blank")}> 
                                      <Download className="mr-2 h-4 w-4" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled>View History</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {doc.status === "pending" && (
                                      <>
                                        <DropdownMenuItem>
                                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
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
                    )
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