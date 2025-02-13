"use client";

import { AlertCircle } from "lucide-react";

import { ProductHeader } from "@/components/dashboard/products/product-header";
import { ProductList } from "@/components/dashboard/products/product-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProducts } from "@/lib/hooks/use-products";

export default function ProductsPage() {
  const { products, isLoading, error } = useProducts();

  if (error) {
    return (
      <div className="space-y-6">
        <ProductHeader />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Error Loading Products
            </h2>
            <p className="text-muted-foreground mb-4">{error?.message}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductHeader />
      <ProductList products={products} isLoading={isLoading} />
    </div>
  );
}
