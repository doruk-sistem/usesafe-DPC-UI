"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Battery, FileText, ImageOff, MoreHorizontal, Trash, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useProduct } from "@/lib/hooks/use-product";
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
  const { determineProductStatus } = useProduct("");
  const t = useTranslations("productManagement");

  console.log("Products received:", products);

  const { mutate: deleteProduct } = productsApiHooks.useDeleteProductMutation({
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["getProducts"] });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product. Please try again.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
  });

  const handleDeleteClick = (product: Product) => {
    console.log("Product to delete:", product);
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct({ id: productToDelete.id });
    }
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Loading your products...</CardDescription>
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
          <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
          <p className="text-muted-foreground mb-4">
            Start by adding your first product.
          </p>
          <Button asChild>
            <Link href="/dashboard/products/new">Add Product</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.productName")}</TableHead>
                <TableHead>{t("table.model")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                console.log("Rendering product:", product);
                const documents = Array.isArray(product.documents) 
                  ? product.documents 
                  : Object.values(product.documents || {}).flat();
                
                const status = determineProductStatus(documents);
                
                return (
                  <TableRow key={product.id}>
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
                        {product.model}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        status === "APPROVED" ? "success" :
                        status === "REJECTED" ? "destructive" :
                        "warning"
                      }>
                        {status === "APPROVED" ? "Approved" :
                         status === "REJECTED" ? "Rejected" :
                         "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[220px] bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                          <DropdownMenuLabel className="font-medium px-4 py-3 bg-gray-50 dark:bg-gray-700/50">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                          <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2.5 cursor-pointer">
                            <Link href={`/dashboard/products/${product.id}`} className="flex items-center">
                              <Battery className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="font-medium">View Details</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2.5 cursor-pointer">
                            <Link href={`/dashboard/products/${product.id}/edit`} className="flex items-center">
                              <Pencil className="h-4 w-4 mr-2 text-amber-500" />
                              <span className="font-medium">Edit Product</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2.5 cursor-pointer">
                            <Link href={`/dashboard/products/${product.id}/documents`} className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-green-500" />
                              <span className="font-medium">View Documents</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive flex items-center hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2.5 cursor-pointer"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            <span className="font-medium">Delete Product</span>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.description", { name: productToDelete?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
