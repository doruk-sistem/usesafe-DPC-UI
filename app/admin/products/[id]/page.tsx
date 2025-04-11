import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  FileText,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

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
interface ProductDetailsProps {
  params: {
    id: string;
  };
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

// Veri çekme işlemini ayrı bir fonksiyona taşıyalım
async function getProductDetails(id: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      manufacturer:manufacturer_id (
        id,
        name
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    console.error("Error fetching product:", error);
    return null;
  }

  return product;
}

// Ana component
export default async function ProductDetailsPage({
  params,
}: ProductDetailsProps) {
  const t = await getTranslations();
  const product = await getProductDetails(params.id);

  if (!product) {
    notFound();
  }

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

    if (product.documents) {
      // Dökümanları düzleştir
      if (Array.isArray(product.documents)) {
        allDocuments.push(...(product.documents as Document[]));
      } else if (typeof product.documents === "object") {
        Object.entries(product.documents).forEach(([docType, docList]) => {
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
            productStatus: "REJECTED",
          },
          {
            condition: hasPendingDocuments,
            status: "pending",
            productStatus: "PENDING",
          },
          {
            condition: hasExpiredDocuments,
            status: "hasExpired",
            productStatus: "EXPIRED",
          },
          {
            condition: hasApprovedDocuments,
            status: "allApproved",
            productStatus: "APPROVED",
          },
        ];

        // İlk eşleşen durumu bul
        const currentStatus = statusPriority.find(
          (status) => status.condition
        ) || {
          status: "unknown",
          productStatus: "NEW",
        };

        // Döküman durumunu ve ürün durumunu güncelle
        documentStatus = t(
          `admin.products.details.documents.documentStatuses.${currentStatus.status}`
        );
        product.status = currentStatus.productStatus;
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
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <Badge variant="outline">{product.product_type}</Badge>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/admin/documents?product=${product.id}`}>
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
                  <p className="font-medium">{product.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.productInfo.manufacturer")}
                  </p>
                  <p className="font-medium">{product.manufacturer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.productInfo.type")}
                  </p>
                  <p className="font-medium">{product.product_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.productInfo.status")}
                  </p>
                  <div className="font-medium">
                    {product.status ? (
                      <Badge variant="outline" className="capitalize">
                        {product.status}
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
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {product.description && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.products.details.productInfo.description")}
                  </p>
                  <p className="mt-1">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t("admin.products.details.documents.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>
                    {t("admin.products.details.documents.totalDocuments")}
                  </span>
                  <Badge variant="secondary">
                    {documentCount}{" "}
                    {t("admin.products.details.documents.totalDocuments")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    {t("admin.products.details.documents.documentStatus")}
                  </span>
                  <Badge
                    variant={
                      documentStatus === "All Approved"
                        ? "success"
                        : documentStatus === "Pending Review"
                        ? "warning"
                        : documentStatus === "Has Rejected Documents"
                        ? "destructive"
                        : documentStatus === "Has Expired Documents"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {documentStatus}
                  </Badge>
                </div>

                {documentCount > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">
                      {t("admin.products.details.documents.title")}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {allDocuments.map((doc, index) => (
                        <Dialog key={`${doc.id}-${index}`}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start ${getStatusColor(
                                doc.status
                              )}`}
                            >
                              <div className="flex items-center gap-2 w-full">
                                {getStatusIcon(doc.status)}
                                <span className="truncate">
                                  {doc.name || doc.type || "Unnamed Document"}
                                </span>
                                <Badge variant="outline" className="ml-auto">
                                  {doc.status}
                                </Badge>
                              </div>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {doc.name || doc.type || "Document Details"}
                              </DialogTitle>
                              <DialogDescription>
                                {t(
                                  "admin.products.details.documents.description"
                                )}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {t("admin.products.details.documents.id")}
                                  </p>
                                  <div className="font-medium">{doc.id}</div>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {t("admin.products.details.documents.type")}
                                  </p>
                                  <div className="font-medium">
                                    {doc.type || "N/A"}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {t(
                                      "admin.products.details.documents.documentStatus"
                                    )}{" "}
                                  </p>
                                  <div className="font-medium">
                                    <Badge
                                      variant={
                                        doc.status === "approved"
                                          ? "success"
                                          : doc.status === "pending"
                                          ? "warning"
                                          : "destructive"
                                      }
                                    >
                                      {doc.status}
                                    </Badge>
                                  </div>
                                </div>
                                {doc.validUntil && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      {t(
                                        "admin.products.details.documents.validUntil"
                                      )}
                                    </p>
                                    <div className="font-medium">
                                      {new Date(
                                        doc.validUntil
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {doc.rejection_reason && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {t(
                                      "admin.products.details.documents.rejectionReason"
                                    )}
                                  </p>
                                  <div className="mt-1 p-2 bg-red-50 text-red-800 rounded-md">
                                    {doc.rejection_reason}
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" asChild>
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {t(
                                      "admin.products.details.documents.viewDocument"
                                    )}
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
    console.error("Error in ProductDetailsPage:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-semibold text-destructive">
          Error Loading Product
        </h2>
        <p className="text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
      </div>
    );
  }
}
