"use client";

import { Suspense, useState } from "react";
import { ArrowLeft, Package, ExternalLink, Calendar, User, MapPin, Percent, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useDistributor } from "@/lib/hooks/use-distributors";
import { useDistributorProducts, useRemoveDistributorFromProduct } from "@/lib/hooks/use-distributors";

export default function DistributorProductsPage() {
  const params = useParams();
  const distributorId = params.id as string;
  const t = useTranslations("distributors");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/distributors/${distributorId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("products.title")}</h1>
            <p className="text-muted-foreground">{t("products.description")}</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<DistributorProductsSkeleton />}>
        <DistributorProducts distributorId={distributorId} />
      </Suspense>
    </div>
  );
}

function DistributorProducts({ distributorId }: { distributorId: string }) {
  const { distributor, isLoading: distributorLoading } = useDistributor(distributorId);
  const { distributorProducts: products, isLoading: productsLoading, error } = useDistributorProducts(distributorId);
  const removeDistributorMutation = useRemoveDistributorFromProduct();
  const { toast } = useToast();
  const t = useTranslations("distributors");
  
  // Modal state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  if (distributorLoading || productsLoading) {
    return <DistributorProductsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("products.error.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("products.error.description")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "inactive":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleRemoveProductClick = (productId: string, productName: string) => {
    setProductToDelete({ id: productId, name: productName });
    setShowDeleteDialog(true);
  };

  const handleConfirmRemoveProduct = async () => {
    if (!productToDelete) return;

    try {
      await removeDistributorMutation.mutateAsync({
        productId: productToDelete.id,
        distributorId
      });
      
      toast({
        title: t("products.remove.success.title"),
        description: t("products.remove.success.description", { productName: productToDelete.name }),
      });
      
      setShowDeleteDialog(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error removing product from distributor:", error);
      toast({
        title: t("products.remove.error.title"),
        description: t("products.remove.error.description"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Distribütör Bilgileri */}
      {distributor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("products.distributorInfo.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("products.distributorInfo.name")}
                </label>
                <p className="font-semibold">{distributor.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("products.distributorInfo.taxNumber")}
                </label>
                <p className="font-mono text-sm">{distributor.taxInfo.taxNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("products.distributorInfo.totalProducts")}
                </label>
                <Badge variant="outline">
                  {products.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ürün Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>{t("products.list.title")}</CardTitle>
          <CardDescription>{t("products.list.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("products.list.empty.title")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("products.list.empty.description")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("products.list.columns.product")}</TableHead>
                  <TableHead>{t("products.list.columns.type")}</TableHead>
                  <TableHead>{t("products.list.columns.status")}</TableHead>
                  <TableHead>{t("products.list.columns.territory")}</TableHead>
                  <TableHead>{t("products.list.columns.commission")}</TableHead>
                  <TableHead>{t("products.list.columns.assignedBy")}</TableHead>
                  <TableHead>{t("products.list.columns.assignedAt")}</TableHead>
                  <TableHead>{t("products.list.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((productAssignment) => (
                  <TableRow key={productAssignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{productAssignment.product?.name || "Bilinmeyen Ürün"}</p>
                          {productAssignment.product?.model && (
                            <p className="text-sm text-muted-foreground">{productAssignment.product.model}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {productAssignment.product?.productType || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(productAssignment.status)}>
                        {t(`products.list.status.${productAssignment.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {productAssignment.territory || t("products.list.territory.notSpecified")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {productAssignment.commissionRate ? (
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            %{productAssignment.commissionRate}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {productAssignment.assignedByCompany || productAssignment.assignedBy || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {productAssignment.assignedAt ? formatDate(productAssignment.assignedAt) : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {productAssignment.product && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/products/${productAssignment.product.id}`}>
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">{t("products.list.actions.viewProduct")}</span>
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProductClick(
                            productAssignment.productId,
                            productAssignment.product?.name || "Bilinmeyen Ürün"
                          )}
                          disabled={removeDistributorMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("products.list.actions.removeProduct")}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Notlar */}
      {products.some(p => p.notes) && (
        <Card>
          <CardHeader>
            <CardTitle>{t("products.notes.title")}</CardTitle>
            <CardDescription>{t("products.notes.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products
                .filter(p => p.notes)
                .map((productAssignment) => (
                  <div key={productAssignment.id} className="border-l-2 border-primary/20 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {productAssignment.product?.name || "Bilinmeyen Ürün"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{productAssignment.notes}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Silme Onay Modalı */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("products.remove.dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("products.remove.dialog.description", { 
                productName: productToDelete?.name || "",
                distributorName: distributor?.name || ""
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("products.remove.dialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemoveProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeDistributorMutation.isPending}
            >
              {removeDistributorMutation.isPending 
                ? t("products.remove.dialog.removing") 
                : t("products.remove.dialog.confirm")
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DistributorProductsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-5 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 