"use client";

import { Box, ExternalLink, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { productService } from "@/lib/services/product";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useProduct as useProductOriginal } from "@/lib/hooks/use-product";
import { ProductDetails } from "@/components/products/product-details";

interface ManufacturerProductsProps {
  manufacturerId: string;
}

function useProductForModal(id: string) {
  return useProductOriginal(id);
}

export function ManufacturerProducts({ manufacturerId }: ManufacturerProductsProps) {
  const t = useTranslations("adminDashboard.sections.manufacturers.details");
  const tCategories = useTranslations("products.list.categories");
  const tProducts = useTranslations("products");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const filteredProducts = statusFilter === "all"
    ? products
    : products.filter((product) => {
        const status = (product.status || "").toLowerCase();
        return status === statusFilter.toLowerCase();
      });
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { product: selectedProduct, isLoading: isProductLoading, error: productError } = useProductForModal(selectedProductId || "");

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

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const prods = await productService.getProducts({ manufacturerId });
      setProducts(prods);
      setLoading(false);
    }
    fetchProducts();
  }, [manufacturerId]);

  if (loading) return <div>Loading...</div>;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin/manufacturers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("backToList")}
              </Button>
            </Link>
            <CardTitle>{t("products.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Filter Dropdown - top right */}
          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t("products.allStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products.allStatus")}</SelectItem>
                  <SelectItem value="approved">{t("products.status.approved")}</SelectItem>
                  <SelectItem value="pending">{t("products.status.pending")}</SelectItem>
                  <SelectItem value="rejected">{t("products.status.rejected")}</SelectItem>
                  <SelectItem value="draft">{t("products.status.draft")}</SelectItem>
                  <SelectItem value="archived">{t("products.status.archived")}</SelectItem>
                  <SelectItem value="new">{t("products.status.NEW")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            {filteredProducts.length === 0 && <div>{t("products.list.empty.description")}</div>}
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-start gap-4">
                  <Box className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {product.certifiedAt && (
                        <>
                          <span>
                            {t("products.certifiedAt")} {new Date(product.certifiedAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      product.status === "APPROVED" || product.status === "approved" || product.status === "certified"
                        ? "success"
                        : product.status === "REJECTED" || product.status === "rejected"
                        ? "destructive"
                        : product.status === "DRAFT" || product.status === "draft"
                        ? "secondary"
                        : product.status === "ARCHIVED" || product.status === "archived"
                        ? "outline"
                        : product.status === "NEW" || product.status === "new"
                        ? "default"
                        : product.status === "PENDING" || product.status === "pending"
                        ? "warning"
                        : "warning"
                    }
                  >
                    {t(`products.status.${product.status}`)}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedProductId(product.id)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
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
          </div>
        </CardContent>
      </Card>
      {/* Modal for product details */}
      <Dialog open={!!selectedProductId} onOpenChange={() => setSelectedProductId(null)}>
        <DialogContent className="max-w-5xl w-full h-[90vh] overflow-y-auto p-0 bg-background">
          <DialogHeader>
            <DialogTitle>
              {t("products.title")}
            </DialogTitle>
            <DialogDescription>
              {t("products.description")}
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