"use client";

import { Box, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useProduct } from "@/lib/hooks/use-product";
import { ProductDetails } from "@/components/products/product-details";
import { useProducts } from "@/lib/hooks/use-products";

interface CompanyProductsProps {
  companyId: string;
}

export function CompanyProducts({ companyId }: CompanyProductsProps) {
  const t = useTranslations("admin.products");
  const [search, setSearch] = useState("");
  const { products, isLoading, error } = useProducts(companyId);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { product: selectedProduct, isLoading: isProductLoading, error: productError } = useProduct(selectedProductId || "");

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("list.error.title")}</CardTitle>
          <CardDescription>{t("list.error.description")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("loading")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("list.title")}</CardTitle>
              <CardDescription>{t("list.description")}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder={t("list.search.placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.length === 0 && <div>{t("list.empty.description")}</div>}
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-start gap-4">
                  <Box className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{product.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedProductId(product.id)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal for product details */}
      <Dialog open={!!selectedProductId} onOpenChange={() => setSelectedProductId(null)}>
        <DialogContent className="max-w-5xl w-full h-[90vh] overflow-y-auto p-0 bg-background">
          <DialogHeader>
            <DialogTitle>
              {t("list.title")}
            </DialogTitle>
            <DialogDescription>
              {t("list.description")}
            </DialogDescription>
          </DialogHeader>
          {isProductLoading ? (
            <div className="flex items-center justify-center h-40">Loading...</div>
          ) : productError ? (
            <div className="flex items-center justify-center h-40 text-destructive">Ürün bulunamadı</div>
          ) : selectedProduct ? (
            <div className="p-4 sm:p-8">
              <ProductDetails product={selectedProduct} additionalComponents={null} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
