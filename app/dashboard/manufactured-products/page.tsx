"use client";

import {
  Plus,
  MoreHorizontal,
  FileText,
  Eye,
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loading } from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePendingProducts } from "@/lib/hooks/use-pending-products";
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

  const { data, isLoading, error } = usePendingProducts(pageIndex, pageSize);

  const handleViewDocuments = (productId: string) => {
    setSelectedProductId(productId);
    setShowDocumentsDialog(true);
  };

  const hasPendingDocuments = (product: BaseProduct) => {
    if (!product.documents) return false;
    return Object.values(product.documents).some(
      (doc: Document) => doc.status === "pending"
    );
  };

  const getStatusDisplay = (status: string, product?: BaseProduct) => {
    switch (status) {
      case "NEW":
        return t("pages.pendingProducts.status.new");
      case "DRAFT":
        return t("pages.pendingProducts.status.draft");
      case "PENDING":
        return t("pages.pendingProducts.status.pending");
      case "REJECTED":
        return t("pages.pendingProducts.status.rejected");
      case "ARCHIVED":
        return t("pages.pendingProducts.status.archived");
      case "DELETED":
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
      case "ARCHIVED":
        return "secondary";
      case "DELETED":
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
            {(data?.items || []).map((product: BaseProduct) => {
                const pendingDocs = hasPendingDocuments(product);
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
                        {getStatusDisplay(product.status || "", product).toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pendingDocs ? (
                        <Badge variant="warning">
                          {t("pages.pendingProducts.status.pendingDocuments")}
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          {t(
                            "pages.pendingProducts.status.allDocumentsApproved"
                          )}
                        </Badge>
                          )}
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
                                    {t(
                                      "pages.pendingProducts.actions.icons.documents"
                                    )}
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
    </div>
  );
}
