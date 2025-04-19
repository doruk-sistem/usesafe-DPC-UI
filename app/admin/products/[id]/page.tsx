"use client";

import {
  FileText,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProduct } from "@/lib/hooks/use-product";
import { Document } from "@/lib/types/document";

import { getStatusIcon, getStatusColor } from "../../../../lib/utils/document-utils";

interface ProductDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsProps) {
  const { id } = use(params);
  const t = useTranslations();
  const { isLoading: isAuthLoading } = useAuth();
  const { product, isLoading: isProductLoading, error } = useProduct(id);

  const isLoading = isAuthLoading || isProductLoading;

  if (isLoading) {
    return <Loading />;
  }

  if (error || !product) {
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
    }

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
