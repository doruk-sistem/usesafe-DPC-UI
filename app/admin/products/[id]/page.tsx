"use client";

import {
  FileText,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProduct } from "@/lib/hooks/use-product";
import { DocumentStatus } from "@/lib/types/document";
import { ProductStatus } from "@/lib/types/product";

interface ProductDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

interface Document {
  id: string;
  name: string;
  status: DocumentStatus;
  type?: string;
  validUntil?: string;
  rejection_reason?: string;
  [key: string]: any;
}

export default function ProductDetailsPage({ params }: ProductDetailsProps) {
  const { id } = use(params);
  const t = useTranslations();
  const {
    user,
    company,
    isLoading: isAuthLoading,
    isCompanyLoading,
    isAdmin,
  } = useAuth();
  const { product, isLoading: isProductLoading, error } = useProduct(id);

  // Debug için console.log ekleyelim
  console.log("Page State:", {
    user,
    company,
    isAuthLoading,
    isCompanyLoading,
    isAdmin: isAdmin(),
    userRole: user?.user_metadata?.role,
    product,
    error,
    id
  });

  // Tüm loading state'leri birleştir
  const isLoading = isAuthLoading || isCompanyLoading || isProductLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Auth kontrolü
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">
          {t("common.auth.required")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("common.auth.loginRequired")}
        </p>
        <Button asChild>
          <Link href="/login">
            {t("common.buttons.login")}
          </Link>
        </Button>
      </div>
    );
  }

  // Admin kullanıcıları için company kontrolünü bypass et
  if (!isAdmin() && !company) {
    console.log("Company check failed:", {
      isAdmin: isAdmin(),
      company,
      userRole: user?.user_metadata?.role
    });
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">
          {t("common.auth.required")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("common.auth.companyRequired")}
        </p>
        <Button asChild>
          <Link href="/admin">
            {t("common.buttons.dashboard")}
          </Link>
        </Button>
      </div>
    );
  }

  // Hata kontrolünü geliştir
  if (error || !product) {
    // Only log the error if it's not a simple "not found" case
    console.error("Product error details:", {
      error,
      productData: product,
      errorMessage: error?.message,
      id
    });

    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">
          {t("admin.products.errors.notFound")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {error?.message || t("admin.products.errors.notFoundDescription")}
        </p>
        <Button asChild>
          <Link href="/admin/products">{t("common.buttons.back")}</Link>
        </Button>
      </div>
    );
  }

  const productData = product;

  try {
    // Döküman durumunu ve sayısını hesapla
    let documentCount = 0;
    let documentStatus = t(
      "admin.products.details.documents.documentStatuses.noDocuments"
    );
    let hasRejectedDocuments = false;
    let hasPendingDocuments = false;
    let hasExpiredDocuments = false;
    let hasApprovedDocuments = false;
    const allDocuments: Document[] = [];

    if (productData.documents) {
      // Dökümanları düzleştir
      if (Array.isArray(productData.documents)) {
        allDocuments.push(...(productData.documents as Document[]));
      } else if (typeof productData.documents === "object") {
        Object.entries(productData.documents).forEach(([docType, docList]) => {
          if (Array.isArray(docList)) {
            const typedDocs = (docList as Document[]).map((doc) => ({
              ...doc,
              type: docType,
            }));
            allDocuments.push(...typedDocs);
          }
        });
      }

      documentCount = allDocuments.length;

      if (documentCount > 0) {
        // Döküman durumlarını enum olarak tanımlayalım
        const DocumentStatuses = {
          REJECTED: "rejected",
          PENDING: "pending",
          EXPIRED: "expired",
          APPROVED: "approved",
        } as const;

        // Durumları bir Map ile kontrol edelim
        const statusFlags = {
          [DocumentStatuses.REJECTED]: () => (hasRejectedDocuments = true),
          [DocumentStatuses.PENDING]: () => (hasPendingDocuments = true),
          [DocumentStatuses.EXPIRED]: () => (hasExpiredDocuments = true),
          [DocumentStatuses.APPROVED]: () => (hasApprovedDocuments = true),
        };

        // Döküman durumlarını kontrol et
        allDocuments.forEach((doc) => {
          const status = (doc.status || "").toLowerCase();
          // Eğer geçerli bir status varsa ilgili flag'i güncelle
          statusFlags[status]?.();
        });

        // Durum öncelik sırası (en önemliden en önemsize)
        const statusPriority = [
          {
            key: "rejected",
            condition: hasRejectedDocuments,
            status: "hasRejected",
            productStatus: "REJECTED" as ProductStatus,
          },
          {
            key: "pending",
            condition: hasPendingDocuments,
            status: "pending",
            productStatus: "PENDING" as ProductStatus,
          },
          {
            key: "expired",
            condition: hasExpiredDocuments,
            status: "hasExpired",
            productStatus: "EXPIRED" as ProductStatus,
          },
          {
            key: "approved",
            condition: hasApprovedDocuments,
            status: "allApproved",
            productStatus: "APPROVED" as ProductStatus,
          },
        ];

        // İlk eşleşen durumu bul
        const currentStatus = statusPriority.find(
          (status) => status.condition
        ) || {
          key: "unknown",
          status: "unknown",
          productStatus: "NEW" as ProductStatus,
        };

        // Döküman durumunu ve ürün durumunu güncelle
        documentStatus = t(
          `admin.products.details.documents.documentStatuses.${currentStatus.status}`
        );
        // Status'u güncellemek yerine sadece görüntüleme için kullanıyoruz
        const displayStatus = currentStatus.productStatus;
      }
    }
    // Döküman durumuna göre ikon ve renk belirleme
    const getStatusIcon = (status: DocumentStatus | string) => {
      const statusLower = (status || "").toLowerCase();
      switch (statusLower) {
        case "approved":
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case "rejected":
          return <XCircle className="h-4 w-4 text-red-500" />;
        case "pending":
          return <Clock className="h-4 w-4 text-yellow-500" />;
        case "expired":
          return <AlertCircle className="h-4 w-4 text-red-500" />;
        default:
          return <FileText className="h-4 w-4 text-gray-500" />;
      }
    };

    const getStatusColor = (status: DocumentStatus | string) => {
      const statusLower = (status || "").toLowerCase();
      switch (statusLower) {
        case "approved":
          return "bg-green-100 text-green-800 hover:bg-green-200";
        case "rejected":
          return "bg-red-100 text-red-800 hover:bg-red-200";
        case "pending":
          return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
        case "expired":
          return "bg-red-100 text-red-800 hover:bg-red-200";
        default:
          return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">
                {t("admin.products.details.backButton")}
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">{productData.name}</h1>
            <Badge variant="outline">{productData.product_type}</Badge>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/admin/documents?product=${productData.id}`}>
                <FileText className="mr-2 h-4 w-4" />
                {t("admin.products.details.viewDocuments")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("admin.products.details.productInfo.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.productInfo.id")}
                  </p>
                  <p className="font-medium">{productData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.productInfo.manufacturer")}
                  </p>
                  <p className="font-medium">
                    {productData.manufacturer_id ||
                      t("common.labels.notAvailable")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.productInfo.type")}
                  </p>
                  <p className="font-medium">{productData.product_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.productInfo.status")}
                  </p>
                  <div className="font-medium">
                    {productData.status ? (
                      <Badge variant="outline" className="capitalize">
                        {productData.status}
                      </Badge>
                    ) : (
                      t("common.labels.notAvailable")
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.productInfo.created")}
                  </p>
                  <p className="font-medium">
                    {new Date(productData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {productData.description && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.productInfo.description")}
                  </p>
                  <p className="mt-1">{productData.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("admin.products.details.documents.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.documents.documentStatus")}
                  </p>
                  <Badge variant="outline">{documentStatus}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.documents.totalDocuments")}
                  </p>
                  <p className="font-medium">{documentCount}</p>
                </div>
                {allDocuments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t("admin.products.details.documents.description")}
                    </p>
                    <div className="space-y-2">
                      {allDocuments.map((doc, index) => (
                        <div
                          key={`${doc.id || "doc"}-${doc.name}-${
                            doc.type || "unknown"
                          }-${index}`}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(doc.status)}
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              {doc.type && (
                                <p className="text-sm text-muted-foreground">
                                  {doc.type}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={getStatusColor(doc.status)}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering product details:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">
          {t("common.errors.title")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("common.errors.unexpectedError")}
        </p>
        <Button asChild>
          <Link href="/admin/products">{t("common.buttons.back")}</Link>
        </Button>
      </div>
    );
  }
}
