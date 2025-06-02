"use client";

import { Box, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
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

interface ManufacturerProductsProps {
  manufacturerId: string;
}

export function ManufacturerProducts({ manufacturerId }: ManufacturerProductsProps) {
  const t = useTranslations("adminDashboard.sections.manufacturers.details");
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
        if (statusFilter === "All Approved") return product.status === "APPROVED" || product.status === "approved";
        if (statusFilter === "Pending Review") return product.status === "PENDING" || product.status === "pending";
        if (statusFilter === "Has Rejected Documents") return product.status === "REJECTED" || product.status === "rejected";
        if (statusFilter === "No Documents") return !product.status || product.status === "";
        return product.status === statusFilter;
      });
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("products.filterByStatus") || "All Statuses"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("products.allStatus") || "All Statuses"}</SelectItem>
            <SelectItem value="All Approved">{t("products.allApproved") || "All Approved"}</SelectItem>
            <SelectItem value="Pending Review">{t("products.pendingReview") || "Pending Review"}</SelectItem>
            <SelectItem value="Has Rejected Documents">{t("products.hasRejectedDocuments") || "Has Rejected Documents"}</SelectItem>
            <SelectItem value="No Documents">{t("products.noDocuments") || "No Documents"}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("products.title")}</CardTitle>
        </CardHeader>
        <CardContent>
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
                      <span>{t("products.category")}: {product.category}</span>
                      <span>·</span>
                      <span>{product.id}</span>
                      {product.certifiedAt && (
                        <>
                          <span>·</span>
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
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/certifications/${product.dpcId}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
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
    </div>
  );
}