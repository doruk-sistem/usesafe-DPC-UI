"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  MoreHorizontal,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ProductDocuments } from "@/components/dashboard/products/product-documents";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { usePendingProducts } from "@/lib/hooks/use-pending-products";
import { ProductService } from "@/lib/services/product";
import { Document } from "@/lib/types/document";
import { BaseProduct } from "@/lib/types/product";

export default function PendingProductsPage() {
  const t = useTranslations();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { user } = useAuth();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, error } = usePendingProducts(pageIndex, pageSize);

  const handleViewDocuments = (productId: string) => {
    setSelectedProductId(productId);
    setShowDocumentsDialog(true);
  };

  const handleApproveProduct = async (productId: string) => {
    if (!user?.id) {
      toast({
        title: "Hata",
        description: "Kullanıcı bilgisi bulunamadı",
        variant: "destructive",
      });
      return;
    }

    try {
      await ProductService.approveProduct(productId, user.id);
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla onaylandı ve taslak olarak kopyalandı.",
      });
      queryClient.invalidateQueries({ queryKey: ["pending-products"] });
    } catch (error) {
      toast({
        title: "Hata",
        description:
          error instanceof Error
            ? error.message
            : "Ürün onaylanırken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleRejectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedProductId || !user?.id) {
      toast({
        title: "Hata",
        description: "Kullanıcı bilgisi veya ürün ID'si bulunamadı",
        variant: "destructive",
      });
      return;
    }

    try {
      await ProductService.rejectProduct(selectedProductId, user.id, rejectionReason);
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla reddedildi",
      });
      queryClient.invalidateQueries({ queryKey: ["pending-products"] });
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (error) {
      toast({
        title: "Hata",
        description:
          error instanceof Error
            ? error.message
            : "Ürün reddedilirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const hasPendingDocuments = (product: BaseProduct) => {
    if (!product.documents) return false;
    return Object.values(product.documents).some(
      (doc: Document) => doc.status === "pending"
    );
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "draft";
      case "PENDING":
        return "pending";
      case "REJECTED":
        return "rejected";
      default:
        return status.toLowerCase();
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "destructive";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return <Loading />;
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
                  {t("productManagement.list.columns.status")}
                </TableHead>
                <TableHead>Belgeler</TableHead>
                <TableHead>
                  {t("productManagement.list.columns.createdAt")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items || []).map((product: BaseProduct) => {
                const pendingDocs = hasPendingDocuments(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {product.model}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(product.status || "")}>
                        {getStatusDisplay(product.status || "").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pendingDocs ? (
                        <Badge variant="warning">Bekleyen Belgeler</Badge>
                      ) : (
                        <Badge variant="success">Tüm Belgeler Onaylı</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(product.created_at).toLocaleDateString()}
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
                            <DropdownMenuItem
                              onClick={() => handleViewDocuments(product.id)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Belgeleri Görüntüle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                window.location.href = `/dashboard/products/${product.id}`;
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Detayları Görüntüle
                            </DropdownMenuItem>
                            {product.status === "NEW" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Kontrol</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleApproveProduct(product.id)
                                  }
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Ürünü Onayla
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRejectProduct(product.id)
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                  Ürünü Reddet
                                </DropdownMenuItem>
                              </>
                            )}
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
              <ProductDocuments productId={selectedProductId} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ürünü Reddet</DialogTitle>
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
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedProductId(null);
              }}
            >
              İptal
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
