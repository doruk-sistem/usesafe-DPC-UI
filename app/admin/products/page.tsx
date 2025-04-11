"use client";

import { useTranslations } from "next-intl";

import { ProductList } from "@/components/admin/products/product-list";

export default function ProductsPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.products.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("admin.products.description")}
        </p>
      </div>

      <ProductList />
    </div>
  );
}
