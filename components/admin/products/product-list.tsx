"use client";

import {
  Package,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { documentsApiHooks } from "@/lib/hooks/use-documents";
import { ProductWithMetadata , ProductStatus } from "@/lib/types/product";


export function ProductList() {
  const t = useTranslations();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [manufacturerFilter, setManufacturerFilter] = useState("all");

  const getProductStatusDisplay = (status: ProductStatus) => {
    switch (status) {
      case "PENDING":
        return t("admin.products.status.pending");
      case "DRAFT":
        return t("admin.products.status.draft");
      case "APPROVED":
        return t("admin.products.status.approved");
      case "REJECTED":
        return t("admin.products.status.rejected");
      case "EXPIRED":
        return t("admin.products.status.expired");
      default:
        return t("admin.products.status.unknown");
    }
  };

  const getProductStatusVariant = (
    status: ProductStatus
  ): "default" | "success" | "warning" | "destructive" | "secondary" => {
    switch (status) {
      case "ARCHIVED":
      case "APPROVED":
        return "success";
      case "DELETED":
      case "REJECTED":
        return "destructive";
      case "PENDING":
      case "NEW":
        return "warning";
      case "DRAFT":
        return "secondary";
      case "EXPIRED":
        return "destructive";
      default:
        return "default";
    }
  };

  const { data: products = [], isLoading } = documentsApiHooks.useGetProducts();

  // Process products to include document counts and status
  const processedProducts: ProductWithMetadata[] = products.map((product) => {
    const documentCount = product.documents
      ? Object.values(product.documents).flat().length
      : 0;

    let documentStatus: ProductWithMetadata["document_status"] = "No Documents";
    if (documentCount > 0) {
      const allDocs = Object.values(product.documents).flat() as {
        status: "approved" | "rejected" | "pending";
      }[];
      const hasRejected = allDocs.some((doc) => doc.status === "rejected");
      const allApproved = allDocs.every((doc) => doc.status === "approved");

      if (hasRejected) {
        documentStatus = "Has Rejected Documents";
      } else if (allApproved) {
        documentStatus = "All Approved";
      } else {
        documentStatus = "Pending Review";
      }
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description || "",
      company_id: product.manufacturer_id,
      product_type: product.product_type,
      product_subcategory: product.product_subcategory || "",
      model: product.model,
      status: product.status,
      status_history: product.status_history || [],
      images: product.images || [],
      key_features: product.key_features || [],
      created_at: product.created_at,
      updated_at: product.updated_at,
      manufacturer_id: product.manufacturer_id,
      documents: product.documents,
      manufacturer_name: product.manufacturer?.name || t("admin.products.unknownManufacturer"),
      document_count: documentCount,
      document_status: documentStatus,
    };
  });

  const filteredProducts = processedProducts.filter((product) => {
    // Filter by search query
    if (
      searchQuery &&
      !product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by status
    if (statusFilter !== "all" && product.document_status !== statusFilter) {
      return false;
    }

    // Filter by manufacturer
    if (
      manufacturerFilter !== "all" &&
      product.manufacturer_id !== manufacturerFilter
    ) {
      return false;
    }

    return true;
  });

  const getDocumentStatusDisplay = (status: ProductWithMetadata["document_status"]) => {
    switch (status) {
      case "No Documents":
        return t("admin.products.details.documents.documentStatuses.noDocuments");
      case "Has Rejected Documents":
        return t("admin.products.details.documents.documentStatuses.hasRejected");
      case "All Approved":
        return t("admin.products.details.documents.documentStatuses.allApproved");
      case "Pending Review":
        return t("admin.products.details.documents.documentStatuses.pending");
      default:
        return t("admin.products.details.documents.documentStatuses.unknown");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.products.title")}</CardTitle>
          <CardDescription>{t("admin.products.loading")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              {t("admin.products.title")}
            </CardTitle>
            <CardDescription className="text-base mt-1">
              {t("admin.products.description")}
            </CardDescription>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/admin/products/new">
              <Package className="mr-2 h-4 w-4" />
              {t("admin.products.addNewProduct")}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6 bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.products.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
            <Select
              value={manufacturerFilter}
              onValueChange={setManufacturerFilter}
            >
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue
                  placeholder={t("admin.products.filterByManufacturer")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.products.allManufacturers")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder={t("admin.products.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.products.allStatus")}
                </SelectItem>
                <SelectItem value="All Approved">
                  {t("admin.products.allApproved")}
                </SelectItem>
                <SelectItem value="Pending Review">
                  {t("admin.products.pendingReview")}
                </SelectItem>
                <SelectItem value="Has Rejected Documents">
                  {t("admin.products.hasRejectedDocuments")}
                </SelectItem>
                <SelectItem value="No Documents">
                  {t("admin.products.noDocuments")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t("admin.products.noProductsFound")}
              </h3>
              <p className="text-muted-foreground">
                {products.length === 0
                  ? t("admin.products.noProductsAdded")
                  : t("admin.products.noProductsMatchFilter")}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square relative bg-muted overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={
                            product.images.find((img) => img.is_primary)?.url ||
                            product.images[0].url
                          }
                          alt={
                            product.images.find((img) => img.is_primary)?.alt ||
                            product.name
                          }
                          className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://placehold.co/400x400?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <Package className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-medium line-clamp-1">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {product.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {t("admin.products.created")}: {new Date(product.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>{t("productManagement.actions.menu")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="flex items-center"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {t("admin.products.viewDetails")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/documents?product=${product.id}`}
                            className="flex items-center"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            {t("admin.products.viewDocuments")}
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("admin.products.manufacturer")}
                      </span>
                      <span className="text-sm font-medium">
                        {product.manufacturer_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("admin.products.category")}
                      </span>
                      <Badge variant="outline" className="font-normal">
                        {product.product_type ||
                          t("admin.products.uncategorized")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("admin.products.documents")}
                      </span>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {t("admin.products.documentCount", { count: product.document_count })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("admin.products.status")}
                      </span>
                      <Badge
                        variant={
                          product.document_status === "All Approved"
                            ? "success"
                            : product.document_status === "Pending Review"
                            ? "warning"
                            : product.document_status === "Has Rejected Documents"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {getDocumentStatusDisplay(product.document_status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
