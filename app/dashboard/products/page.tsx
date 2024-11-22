"use client";

import { ProductList } from "@/components/dashboard/products/product-list";
import { ProductHeader } from "@/components/dashboard/products/product-header";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <ProductHeader />
      <ProductList />
    </div>
  );
}