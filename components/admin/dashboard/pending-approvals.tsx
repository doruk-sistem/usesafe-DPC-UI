"use client";

import { motion } from "framer-motion";
import { 
  FileQuestion, 
  CheckCircle2, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { ProductDetails } from "@/components/products/product-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useProduct } from "@/lib/hooks/use-product";
import { useProducts } from "@/lib/hooks/use-products";
import { supabase } from "@/lib/supabase/client";

interface PendingApproval {
  id: string;
  name: string;
  status: string | null;
  created_at?: string;
  company_id: string;
  product_type: string;
  description: string;
  document_status?: string;
}

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

export function PendingApprovals() {
  const t = useTranslations("adminDashboard");
  const { products, isLoading, error } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { product: selectedProduct, isLoading: isProductLoading, error: productError } = useProduct(selectedProductId || "");

  // Pagination state
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Filter pending applications - match admin panel logic
  const pendingApps = products.filter((p) => {
    const status = (p.status || "").toUpperCase();
    const docStatus = (p.document_status || "").toUpperCase();
    
    // Show products that are either:
    // 1. Have status "PENDING"
    // 2. Have document_status "PENDING REVIEW"
    return status === "PENDING" || docStatus === "PENDING REVIEW";
  });

  // Pagination logic
  const totalPages = Math.ceil(pendingApps.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApps = pendingApps.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-lg p-6 border">
        <div className="animate-pulse space-y-4">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-white rounded-xl shadow-lg p-6 border">
        <div className="text-red-600 flex items-center justify-center gap-2">
          <XCircle className="h-5 w-5" />
          <span>Uygulamalar yüklenirken bir hata oluştu</span>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-lg p-6 border"
    >
      <h2 className="text-xl font-semibold mb-4">{t("sections.pendingApprovals.title")}</h2>
      <div className="space-y-4">
        {pendingApps.length === 0 ? (
          <div className="text-muted-foreground">{t("sections.pendingApprovals.noApprovals")}</div>
        ) : (
          paginatedApps.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 hover:bg-muted/50 rounded-lg transition-colors duration-200 group"
            >
              <div className={`
                p-3 rounded-full 
                ${app.status === "PENDING"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-yellow-100 text-yellow-600"}
              `}>
                {app.status === "PENDING" && <FileQuestion className="h-5 w-5" />}
                {app.status === "NEW" && <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate max-w-[180px]" title={app.name}>{app.name}</h3>
                <p className="text-sm text-muted-foreground truncate max-w-[160px]">
                  {app.created_at ? new Date(app.created_at).toLocaleDateString() : "-"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`
                  px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
                  ${app.status === "PENDING"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-yellow-50 text-yellow-600"}
                `}>
                  {app.status === "PENDING" ? t("sections.pendingApprovals.status.pending") : t("sections.pendingApprovals.status.review")}
                </div>
                <button
                  onClick={() => setSelectedProductId(app.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ))
        )}
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

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProductId} onOpenChange={() => setSelectedProductId(null)}>
        <DialogContent className="max-w-5xl w-full h-[90vh] overflow-y-auto p-0 bg-background">
          <DialogHeader>
            <DialogTitle>
              {t("sections.pendingApprovals.title")}
            </DialogTitle>
            <DialogDescription>
              {t("sections.pendingApprovals.description")}
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
    </motion.div>
  );
}