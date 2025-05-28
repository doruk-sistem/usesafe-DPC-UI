"use client";

import {
  Plus,
  MoreHorizontal,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ProductDocuments } from "@/components/dashboard/products/product-documents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/lib/hooks/use-products";
import { Document } from "@/lib/types/document";
import { BaseProduct } from "@/lib/types/product";

export default function PendingProductsPage() {
  const t = useTranslations();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { products = [], isLoading, error } = useProducts();

  const handleViewDocuments = (productId: string) => {
    setSelectedProductId(productId);
    setShowDocumentsDialog(true);
  };

  const handleApproveProduct = (productId: string) => {
    // approveProduct(productId);
  };

  const handleRejectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedProductId) return;

    // rejectProduct({ productId: selectedProductId, reason: rejectionReason });
    setShowRejectDialog(false);
    setRejectionReason("");
  };

  const getDocumentStatusBadge = (product: BaseProduct) => {
    if (!product.documents || Object.keys(product.documents).length === 0) {
      return <Badge variant="secondary">No Documents</Badge>;
    }
    const allDocs = Object.values(product.documents).flat();
    if (allDocs.some((doc: any) => (doc.status || '').toLowerCase() === 'pending' || !doc.status)) {
      return <Badge variant="warning">Pending</Badge>;
    }
    if (allDocs.every((doc: any) => (doc.status || '').toLowerCase() === 'approved')) {
      return <Badge variant="success">All Documents Approved</Badge>;
    }
    return <Badge variant="secondary">No Documents</Badge>;
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "NEW":
        return t("pages.pendingProducts.status.new");
      case "DRAFT":
        return t("pages.pendingProducts.status.draft");
      case "PENDING":
        return t("pages.pendingProducts.status.pending");
      case "REJECTED":
        return t("pages.pendingProducts.status.rejected");
      default:
        return status.toLowerCase();
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "destructive";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("pages.pendingProducts.title")}</CardTitle>
            <CardDescription>
              {t("pages.pendingProducts.description")}
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/dashboard/products/new";
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("common.buttons.addNew")}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("productManagement.list.columns.product")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.status")}
                </TableHead>
                <TableHead>
                  {t("pages.pendingProducts.columns.documents")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.createdAt")}
                </TableHead>
                <TableHead>
                  {t("productManagement.list.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products
                .filter(product =>
                  (product.status || '').toUpperCase() === 'PENDING' ||
                  (product.document_status || '').toUpperCase() === 'PENDING REVIEW'
                )
                .map((product: BaseProduct) => {
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {product.model}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(product.status || "")}>
                          {getStatusDisplay(product.status || "").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getDocumentStatusBadge(product)}
                      </TableCell>
                      <TableCell>
                        {new Date(product.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                {t("pages.pendingProducts.actions.title")}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewDocuments(product.id)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                {t("pages.pendingProducts.actions.icons.documents")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `/dashboard/products/${product.id}`;
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {t("pages.pendingProducts.actions.icons.view")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {t("pages.pendingProducts.documentsDialog.title")}
            </DialogTitle>
          </DialogHeader>
          {selectedProductId && (
            <div className="space-y-4">
              <ProductDocuments productId={selectedProductId} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("pages.pendingProducts.rejectDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("pages.pendingProducts.rejectDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="rejection-reason">
              {t("pages.pendingProducts.rejectDialog.reasonLabel")}
            </Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t(
                "pages.pendingProducts.rejectDialog.reasonPlaceholder"
              )}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedProductId(null);
              }}
            >
              {t("pages.pendingProducts.rejectDialog.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              {t("pages.pendingProducts.rejectDialog.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
