"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel,DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Battery, FileText, ImageOff, MoreHorizontal, Trash, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

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
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your product catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Basic Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                      {product.product_type}
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
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {product.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-[180px] bg-white border shadow-lg rounded-md"
                        sideOffset={5}
                      >
                        <DropdownMenuLabel className="font-medium text-sm px-2 py-1.5 bg-gray-50 border-b">
                          Actions
                        </DropdownMenuLabel>
                        <div className="py-1">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/products/${product.id}`} className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer">
                              <Battery className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm">View Details</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/products/${product.id}/edit`} className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer">
                              <Pencil className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm">Edit Product</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/products/${product.id}/documents`} className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer">
                              <FileText className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm">View Documents</span>
                            </Link>
                          </DropdownMenuItem>
                        </div>
                        <div className="border-t py-1">
                          <DropdownMenuItem 
                            className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            <span className="text-sm">Delete Product</span>
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of {products.length} products
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              {productToDelete && <strong> &quot;{productToDelete.name}&quot;</strong>} and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
