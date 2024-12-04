"use client";

import { ProductHeader } from "@/components/dashboard/products/product-header";
import { ProductList } from "@/components/dashboard/products/product-list";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <ProductHeader />
      <ProductList />
    </div>
  );
}