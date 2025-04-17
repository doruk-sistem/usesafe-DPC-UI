"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, MoreHorizontal, FileText, Eye, CheckCircle, XCircle, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/hooks/use-auth";
import { productService } from "@/lib/services/product";
import { ProductDocuments } from "@/components/dashboard/products/product-documents";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface PendingProduct {
  id: string;
  name: string;
  sku: string;
  status: "pending" | "rejected" | "approved";
  createdAt: string;
  manufacturer: string;
  documents?: Record<string, Document[]>;
}

export default function PendingProductsPage() {
  const t = useTranslations();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { user } = useAuth();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["pending-products", pageIndex, pageSize, user?.email],
    queryFn: () => {
      if (!user?.email) {
        console.error("User email is not available");
        return Promise.reject(new Error("User email is not available"));
      }

      return productService.getPendingProducts({
        email: user.email,
        page: pageIndex,
        pageSize,
      });
    },
    enabled: !!user?.email,
  });

  const handleViewDocuments = (productId: string) => {
    setSelectedProductId(productId);
    setShowDocumentsDialog(true);
  };

  // Debug için useEffect ekleyelim
  useEffect(() => {
    if (selectedProductId) {
    }
  }, [selectedProductId]);

  const handleApproveProduct = (productId: string) => {
    console.log(`Ürün onaylandı: ${productId}`);
  };

  const handleRejectProduct = (productId: string) => {
    console.log(`Ürün reddedildi: ${productId}`);
    // Örnek: productService.rejectProduct(productId);
  };

  const handleAddInfo = (productId: string) => {
    console.log(`Ürüne bilgi eklendi: ${productId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("products.title")}</CardTitle>
          <CardDescription>{t("products.loading")}</CardDescription>
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
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("pages.pendingProducts.title")}</CardTitle>
            <CardDescription>
              {t("pages.pendingProducts.description")}
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/dashboard/products/new";
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("common.buttons.addNew")}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("productManagement.list.columns.product")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.manufacturer")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.status")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.createdAt")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items || []).map((product: PendingProduct) => {
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {product.sku}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{product.manufacturer}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "approved"
                            ? "success"
                            : product.status === "rejected"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {product.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDocuments(product.id)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Belgeleri Görüntüle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              window.location.href = `/dashboard/products/${product.id}`;
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detayları Görüntüle
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Kontrol</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleAddInfo(product.id)}>
                              <Info className="h-4 w-4 mr-2" />
                              Bilgi Ekle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Ürün Belgeleri</DialogTitle>
          </DialogHeader>
          {selectedProductId && (
            <div className="space-y-4">
              <ProductDocuments productId={selectedProductId} showApprovalOptions={true} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
