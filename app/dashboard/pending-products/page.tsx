"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, FileText, Eye, CheckCircle, XCircle, Info, Edit } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";

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
  status: "NEW" | "pending" | "rejected" | "approved" | "ARCHIVED" | "DELETED";
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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showSubManufacturerDialog, setShowSubManufacturerDialog] = useState(false);
  const [subManufacturer, setSubManufacturer] = useState<string>("");
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();

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
      console.log("Onaylama işlemi başlatılıyor:", {
        productId,
        userId: user.id,
        currentStatus: "NEW",
        targetStatus: "ARCHIVED"
      });

      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchError) {
        console.error("Ürün getirme hatası:", fetchError);
        throw new Error(`Failed to fetch product: ${fetchError.message}`);
      }

      if (!product) {
        console.error("Ürün bulunamadı:", productId);
        throw new Error(`Product not found: ${productId}`);
      }

      console.log("Mevcut ürün durumu:", {
        productId,
        currentStatus: product.status,
        targetStatus: "ARCHIVED",
        statusHistory: product.status_history,
        documents: product.documents
      });

      // Doğrudan geçiş: NEW -> ARCHIVED
      const transition = {
        from: product.status,
        to: "ARCHIVED",
        timestamp: new Date().toISOString(),
        userId: user.id
      };

      console.log("Durum geçişi oluşturuldu:", transition);

      // Ürünü güncelle - belgelerin durumunu değiştirmeden
      const { data: updateData, error: updateError } = await supabase
        .from("products")
        .update({
          status: "ARCHIVED",
          status_history: [...(product.status_history || []), transition]
        })
        .eq("id", productId)
        .select();

      if (updateError) {
        console.error("Ürün güncelleme hatası:", {
          error: updateError,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw new Error(`Failed to update product: ${updateError.message}`);
      }

      console.log("Ürün durumu başarıyla güncellendi:", {
        productId,
        updateData,
        newStatus: "ARCHIVED"
      });

      toast({
        title: "Başarılı",
        description: "Ürün başarıyla onaylandı ve admin paneline eklendi.",
      });
      // Verileri yenile
      queryClient.invalidateQueries({ queryKey: ["pending-products"] });
    } catch (error) {
      console.error("Error approving product:", error);
      console.error("Hata detayları:", {
        error,
        errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata",
        errorStack: error instanceof Error ? error.stack : undefined,
        errorObject: JSON.stringify(error, null, 2)
      });
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Ürün onaylanırken bir hata oluştu",
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
      console.log("Reddetme işlemi başlatılıyor:", {
        productId: selectedProductId,
        userId: user.id,
        currentStatus: "NEW",
        targetStatus: "DELETED",
        rejectionReason: rejectionReason
      });

      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", selectedProductId)
        .single();

      if (fetchError) {
        console.error("Ürün getirme hatası:", fetchError);
        throw new Error(`Failed to fetch product: ${fetchError.message}`);
      }

      if (!product) {
        console.error("Ürün bulunamadı:", selectedProductId);
        throw new Error(`Product not found: ${selectedProductId}`);
      }

      console.log("Mevcut ürün durumu:", {
        productId: selectedProductId,
        currentStatus: product.status,
        targetStatus: "DELETED",
        statusHistory: product.status_history,
        documents: product.documents
      });

      // Tüm dökümanları reddet
      let updatedDocuments = { ...product.documents };
      let documentsUpdated = false;

      // Dökümanları güncelle
      if (updatedDocuments && typeof updatedDocuments === 'object') {
        for (const docType in updatedDocuments) {
          if (Array.isArray(updatedDocuments[docType])) {
            console.log(`Döküman tipi ${docType} için güncelleme yapılıyor:`, updatedDocuments[docType]);
            
            updatedDocuments[docType] = updatedDocuments[docType].map((doc: any) => {
              if (doc.status === "pending") {
                documentsUpdated = true;
                console.log(`Döküman reddediliyor: ${doc.name} (${doc.id})`);
                return {
                  ...doc,
                  status: "rejected",
                  updatedAt: new Date().toISOString()
                };
              }
              return doc;
            });
          }
        }
      }

      console.log("Güncellenmiş dökümanlar:", updatedDocuments);
      console.log("Dökümanlar güncellendi mi:", documentsUpdated);

      // Doğrudan geçiş: NEW -> DELETED
      const transition = {
        from: product.status,
        to: "DELETED",
        timestamp: new Date().toISOString(),
        userId: user.id,
        reason: rejectionReason
      };

      console.log("Durum geçişi oluşturuldu:", transition);

      // Ürünü güncelle
      const { data: updateData, error: updateError } = await supabase
        .from("products")
        .update({
          status: "DELETED",
          status_history: [...(product.status_history || []), transition],
          documents: updatedDocuments
        })
        .eq("id", selectedProductId)
        .select();

      if (updateError) {
        console.error("Ürün güncelleme hatası:", {
          error: updateError,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw new Error(`Failed to update product: ${updateError.message}`);
      }

      console.log("Ürün durumu başarıyla güncellendi:", {
        productId: selectedProductId,
        updateData,
        newStatus: "DELETED",
        documentsUpdated,
        updatedDocuments: updateData?.[0]?.documents
      });

      toast({
        title: "Başarılı",
        description: documentsUpdated 
          ? "Ürün ve tüm dökümanları başarıyla reddedildi" 
          : "Ürün başarıyla reddedildi",
      });
      // Verileri yenile
      queryClient.invalidateQueries({ queryKey: ["pending-products"] });
      // Dialog'u kapat ve formu sıfırla
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting product:", error);
      console.error("Hata detayları:", {
        error,
        errorMessage: error instanceof Error ? error.message : "Bilinmeyen hata",
        errorStack: error instanceof Error ? error.stack : undefined,
        errorObject: JSON.stringify(error, null, 2)
      });
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Ürün reddedilirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleAddInfo = (productId: string) => {
    console.log(`Ürüne bilgi eklendi: ${productId}`);
  };

  const hasPendingDocuments = (product: PendingProduct) => {
    if (!product.documents) return false;
    return Object.values(product.documents).some((docs) =>
      docs.some((doc) => doc.status === "pending")
    );
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ARCHIVED":
        return "approved";
      case "DELETED":
        return "rejected";
      default:
        return status.toLowerCase();
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ARCHIVED":
        return "success";
      case "DELETED":
        return "destructive";
      default:
        return "default";
    }
  };

  const fetchProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
  };

  const handleUpdateSubManufacturer = async () => {
    if (!selectedProductId) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ sub_manufacturer: subManufacturer })
        .eq('id', selectedProductId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Alt üretici bilgisi güncellendi",
      });

      setShowSubManufacturerDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating sub manufacturer:', error);
      toast({
        title: "Hata",
        description: "Alt üretici bilgisi güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
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
              {(data?.items || []).map((product: PendingProduct) => {
                const pendingDocs = hasPendingDocuments(product);
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
                      <Badge variant={getStatusVariant(product.status)}>
                        {getStatusDisplay(product.status).toUpperCase()}
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
                            {product.status === "NEW" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Kontrol</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => handleApproveProduct(product.id)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Ürünü Onayla
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleRejectProduct(product.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                  Ürünü Reddet
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedProductId(product.id);
                                    setShowSubManufacturerDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Alt Üretici Ekle
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
              <ProductDocuments productId={selectedProductId} showApprovalOptions={false} />
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

      <Dialog open={showSubManufacturerDialog} onOpenChange={setShowSubManufacturerDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alt Üretici Bilgisi</DialogTitle>
            <DialogDescription>
              Ürün için alt üretici bilgisini girin veya düzenleyin
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subManufacturer">Alt Üretici</Label>
              <Input
                id="subManufacturer"
                value={subManufacturer}
                onChange={(e) => setSubManufacturer(e.target.value)}
                placeholder="Alt üretici adı"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubManufacturerDialog(false)}
            >
              İptal
            </Button>
            <Button onClick={handleUpdateSubManufacturer}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
