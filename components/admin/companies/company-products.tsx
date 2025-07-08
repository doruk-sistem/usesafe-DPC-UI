"use client";

import { Box, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ProductDetails } from "@/components/products/product-details";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProduct } from "@/lib/hooks/use-product";
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  function getPaginationRange(current: number, total: number): (number | string)[] {
    const delta = 2;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < total - 1) {
      range.push('...');
    }
    range.unshift(1);
    if (total > 1) range.push(total);
    return range;
  }

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
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("list.empty.description")}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-start gap-4">
                      <Box className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedProductId(product.id)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-1 mt-6 select-none" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 text-lg
                      ${currentPage === 1 ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed' : 'bg-white hover:bg-muted/70 border-muted text-muted-foreground'}`}
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {getPaginationRange(currentPage, totalPages).map((page, idx) =>
                    typeof page === 'string'
                      ? <span key={"ellipsis-"+idx} className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm">...</span>
                      : <button
                          key={page}
                          onClick={() => setCurrentPage(Number(page))}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 font-medium
                            ${currentPage === page
                              ? 'bg-primary/10 text-primary border-primary font-semibold'
                              : 'bg-white text-muted-foreground border-muted hover:bg-muted/70'}
                          `}
                          aria-current={currentPage === page ? 'page' : undefined}
                        >
                          {page}
                        </button>
                  )}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 text-lg
                      ${currentPage === totalPages ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed' : 'bg-white hover:bg-muted/70 border-muted text-muted-foreground'}`}
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>

        <Dialog open={!!selectedProductId} onOpenChange={() => setSelectedProductId(null)}>
          <DialogContent className="max-w-5xl w-full h-[90vh] overflow-y-auto p-0 bg-background">
            <DialogHeader>
              <DialogTitle>{t("details.title")}</DialogTitle>
              <DialogDescription>{t("details.description")}</DialogDescription>
            </DialogHeader>
            {selectedProduct && <ProductDetails product={selectedProduct} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
