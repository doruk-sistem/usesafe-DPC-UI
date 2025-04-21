"use client";

import { Box, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - In a real app, this would come from an API
const productsData = {
  "MFR-001": [
    {
      id: "PROD-001",
      name: "Organic Cotton T-Shirt",
      category: "Apparel",
      status: "certified",
      dpcId: "DPC-001",
      certifiedAt: "2024-03-15T10:30:00",
    },
    {
      id: "PROD-002",
      name: "Recycled Denim Jeans",
      category: "Apparel",
      status: "pending",
      dpcId: "DPC-002",
      certifiedAt: null,
    },
    {
      id: "PROD-003",
      name: "Sustainable Wool Sweater",
      category: "Apparel",
      status: "certified",
      dpcId: "DPC-003",
      certifiedAt: "2024-03-14T15:45:00",
    },
  ],
};

interface ManufacturerProductsProps {
  manufacturerId: string;
}

export function ManufacturerProducts({ manufacturerId }: ManufacturerProductsProps) {
  const t = useTranslations("adminDashboard.sections.manufacturers.details");
  const products = productsData[manufacturerId] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("products.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
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
                  variant={product.status === "certified" ? "success" : "warning"}
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
        </div>
      </CardContent>
    </Card>
  );
}