"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Battery, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Basic Info</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Image
                  src={getImageUrl(product.images?.[0]?.url)}
                  alt={product.images?.[0]?.alt || "Product image"}
                  width={48}
                  height={48}
                  className="rounded-md object-cover"
                  onError={(e) => (e.currentTarget.src = "/images/placeholder-product.png")}
                />
                {product.name}
              </TableCell>
              <TableCell>
                <Badge>{product.product_type || "Unknown"}</Badge>
              </TableCell>
              <TableCell>
                {product.key_features?.slice(0, 3).map((feature) => (
                  <div key={feature.name}>{feature.name}: {feature.value}</div>
                ))}
              </TableCell>
              <TableCell>
                <Badge>{product.status?.toLowerCase()}</Badge>
              </TableCell>
              <TableCell>
                <Button variant="destructive" onClick={() => handleDeleteClick(product)}>
                  <Trash className="h-4 w-4 mr-2" /> Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
