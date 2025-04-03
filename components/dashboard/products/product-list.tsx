"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Battery, FileText, ImageOff, MoreHorizontal, Trash, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { productsApiHooks } from "@/lib/hooks/use-products";
import type { Product } from "@/lib/types/product";
import { StorageHelper } from "@/lib/utils/storage";

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductList({ products, isLoading }: ProductListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const t = useTranslations("productManagement");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  const { mutate: deleteProduct } = productsApiHooks.useDeleteProductMutation({
    onSuccess: () => {
      toast({
        title: t("delete.title"),
        description: t("delete.description"),
      });
      queryClient.invalidateQueries({ queryKey: ["getProducts"] });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t("delete.error.title"),
        description: error instanceof Error ? error.message : t("delete.error.description"),
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
  });

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct({ id: productToDelete.id });
    }
  };

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
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("list.title")}</CardTitle>
          <CardDescription>{t("list.loading")}</CardDescription>
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

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Battery className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("list.empty.title")}</h2>
          <p className="text-muted-foreground mb-4">
            {t("list.empty.description")}
          </p>
          <Button asChild>
            <Link href="/dashboard/products/new">{t("actions.addProduct")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("list.title")}</CardTitle>
          <CardDescription>
            {t("list.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("list.columns.product")}</TableHead>
                <TableHead>{t("list.columns.category")}</TableHead>
                <TableHead>{t("list.columns.basicInfo")}</TableHead>
                <TableHead>{t("list.columns.status")}</TableHead>
                <TableHead className="w-[100px] text-right">{t("list.columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={getImageUrl(product.images[0].url)}
                            alt={product.images[0].alt || 'Product image'}
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
                      {t(`productTypes.${product.product_type.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        {product.key_features.slice(0, 3).map((feature) => (
                          <div key={feature.name} className="flex items-center text-sm">
                            <span className="text-muted-foreground w-20">{feature.name}:</span>
                            <span>{feature.value}</span>
                          </div>
                        ))}
                        {product.key_features.length > 3 && (
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
                        product.status === "NEW"
                          ? "success"
                          : product.status === "DRAFT"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("actions.menu")}</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${product.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            {t("actions.viewDetails")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${product.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("actions.editProduct")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${product.id}/documents`}>
                            <FileText className="mr-2 h-4 w-4" />
                            {t("actions.viewDocuments")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          {t("actions.deleteProduct")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.confirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.confirm.description", { name: productToDelete?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("delete.confirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              {t("delete.confirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
