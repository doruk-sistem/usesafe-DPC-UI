"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import {
  Battery,
  FileText,
  ImageOff,
  MoreHorizontal,
  Trash,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useProduct } from "@/lib/hooks/use-product";
import { useProductCategories } from "@/lib/hooks/use-product-categories";
import { productsApiHooks } from "@/lib/hooks/use-products";
import { BaseProduct } from "@/lib/types/product";
import { StorageHelper } from "@/lib/utils/storage";

interface ProductListProps {
  products: BaseProduct[];
  isLoading: boolean;
  isViewingManufacturer: boolean;
  filters: {
    type: string;
    status: string;
  };
}

export function ProductList({ products, isLoading, isViewingManufacturer }: ProductListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations();
  const [productToDelete, setProductToDelete] = useState<BaseProduct | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { determineProductStatus } = useProduct("");
  const { getCategoryName } = useProductCategories();

  const { mutate: deleteProduct } = productsApiHooks.useDeleteProductMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("common.delete.success"),
      });
      queryClient.invalidateQueries({ queryKey: ["getProducts"] });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("common.delete.error"),
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
  });

  const handleDeleteClick = (product: BaseProduct) => {
    setProductToDelete(product);  
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct({ id: productToDelete.id });
    }
  };

  const handleRowClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  // ✅ getImageUrl için güvenli fallback eklendi
  const getImageUrl = (url?: string): string => {
    if (!url) return "/images/placeholder-product.png";
    if (url.startsWith("http")) return url;

    try {
      return StorageHelper.getPublicUrl(url, {
        bucketName: process.env.NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET || "",
      });
    } catch (error) {
      console.error("Error getting public URL:", error);
      return "/images/placeholder-product.png";
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>
            {t('list.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {isViewingManufacturer ? (
              <p>{t('list.empty.manufacturer')}</p>
            ) : (
              <>
                <p>{t('list.empty.title')}</p>
                <p className="mt-2">{t('list.empty.description')}</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/products/new">
                    {t('list.empty.addButton')}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("products.title")}</CardTitle>
          <CardDescription>{t("products.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("productManagement.list.columns.product")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.category")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.basicInfo")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.status")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const status = determineProductStatus(product);
                
                return (
                  <TableRow 
                    key={product.id} 
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleRowClick(product.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={getImageUrl(product.images[0].url)}
                              alt={product.images[0].alt || t("table.imageAlt")}
                              width={48}
                              height={48}
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                              <ImageOff className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.model}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getCategoryName(product.product_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          {product.key_features?.slice(0, 3).map((feature) => (
                            <div
                              key={feature.name}
                              className="flex items-center text-sm"
                            >
                              <span className="text-muted-foreground w-20">
                                {feature.name}:
                              </span>
                              <span>{feature.value}</span>
                            </div>
                          ))}
                          {product.key_features && product.key_features.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{product.key_features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === "APPROVED"
                            ? "success"
                            : status === "PENDING"
                            ? "warning"
                            : status === "REJECTED"
                            ? "destructive"
                            : status === "ARCHIVED"
                            ? "secondary"
                            : status === "DELETED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {status === "DELETED" ? "REDDEDİLDİ" : status === "NEW" ? "PENDING" : status === "REJECTED" ? "REJECTED" : status || "PENDING"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 rounded-full bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 hover:from-primary/10 hover:via-primary/15 hover:to-primary/10 border border-border/50 shadow-sm transition-all duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4 text-primary/70 hover:text-primary transition-colors" />
                            <span className="sr-only">
                              {t("productManagement.actions.openMenu")}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-[200px] p-2 rounded-xl border border-border/50 shadow-lg bg-gradient-to-b from-background to-muted/30 backdrop-blur-sm"
                        >
                          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            {t("productManagement.actions.menu")}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="my-1 bg-border/50" />
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/products/${product.id}`}
                              className="flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-primary/5 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Battery className="h-4 w-4 mr-2 text-primary/70" />
                              <span>
                                {t("productManagement.actions.viewDetails")}
                              </span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/products/${product.id}/edit`}
                              className="flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-primary/5 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Pencil className="h-4 w-4 mr-2 text-primary/70" />
                              <span>
                                {t("productManagement.actions.editProduct")}
                              </span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/products/${product.id}/documents`}
                              className="flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-primary/5 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileText className="h-4 w-4 mr-2 text-primary/70" />
                              <span>
                                {t("productManagement.actions.viewDocuments")}
                              </span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 bg-border/50" />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(product);
                            }}
                            className="flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/5 transition-colors"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            <span>
                              {t("productManagement.actions.deleteProduct")}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.delete.description", { name: productToDelete?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
