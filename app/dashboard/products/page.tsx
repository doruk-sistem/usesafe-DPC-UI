"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ProductHeader } from "@/components/dashboard/products/product-header";
import { ProductList } from "@/components/dashboard/products/product-list";
import { Error } from "@/components/ui/error";
import { useProducts } from "@/lib/hooks/use-products";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const manufacturerId = searchParams.get("manufacturer");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { products, isLoading, error } = useProducts(manufacturerId || undefined);

  const filteredProducts = products.filter((product) => {
    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by type
    if (typeFilter !== "all" && product.product_type !== typeFilter) {
      return false;
    }

    // Filter by status
    if (statusFilter !== "all" && product.status !== statusFilter) {
      return false;
    }

    return true;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <ProductHeader 
          onSearch={setSearchTerm}
          onFilterChange={setTypeFilter}
          onStatusChange={setStatusFilter}
        />
        <Error 
          title="Error Loading Products"
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductHeader 
        onSearch={setSearchTerm}
        onFilterChange={setTypeFilter}
        onStatusChange={setStatusFilter}
      />
      <ProductList products={filteredProducts} isLoading={isLoading} />
    </div>
  );
}
