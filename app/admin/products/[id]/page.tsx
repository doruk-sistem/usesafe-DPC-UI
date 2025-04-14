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
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { use } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DocumentStatus } from "@/lib/types/document";
import { useProduct } from "@/lib/hooks/use-product";
import { BaseProduct, ProductStatus } from "@/lib/types/product";
import { useAuth } from "@/lib/hooks/use-auth";

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
  const { user, company, isLoading: isAuthLoading, isCompanyLoading } = useAuth();
  const { product, isLoading: isProductLoading, error } = useProduct(id);

  // Auth yükleniyorsa loading göster
  if (isAuthLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading authentication...</div>;
  }

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-4">Please log in to view this page.</p>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  // Şirket bilgisi yükleniyorsa loading göster
  if (isCompanyLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading company information...</div>;
  }

  // Şirket bilgisi yoksa hata göster
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">Company Information Not Found</h2>
        <p className="text-muted-foreground mb-4">Please make sure you are associated with a company.</p>
        <Button asChild>
          <Link href="/admin">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // Ürün yükleniyorsa loading göster
  if (isProductLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading product information...</div>;
  }

  // Hata varsa veya ürün bulunamadıysa 404
  if (error || !product?.data) {
    console.error("Product error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested product could not be found.</p>
        <Button asChild>
          <Link href="/admin/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const productData = product.data;

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
            condition: hasRejectedDocuments,
            status: "hasRejected",
            productStatus: "REJECTED" as ProductStatus,
          },
          {
            condition: hasPendingDocuments,
            status: "pending",
            productStatus: "PENDING" as ProductStatus,
          },
          {
            condition: hasExpiredDocuments,
            status: "hasExpired",
            productStatus: "EXPIRED" as ProductStatus,
          },
          {
            condition: hasApprovedDocuments,
            status: "allApproved",
            productStatus: "APPROVED" as ProductStatus,
          },
        ];

        // İlk eşleşen durumu bul
        const currentStatus = statusPriority.find(
          (status) => status.condition
        ) || {
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
                    {productData.manufacturer_id ? productData.manufacturer_id : "N/A"}
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
                      "N/A"
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
                    {t("admin.products.details.documents.status")}
                  </p>
                  <Badge variant="outline">{documentStatus}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.documents.count")}
                  </p>
                  <p className="font-medium">{documentCount}</p>
                </div>
                {allDocuments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t("admin.products.details.documents.list")}
                    </p>
                    <div className="space-y-2">
                      {allDocuments.map((doc) => (
                        <div
                          key={doc.id}
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
    return <div>Error loading product details</div>;
  }
}
