"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { ProductHeader } from "@/components/dashboard/products/product-header";
import { ProductList } from "@/components/dashboard/products/product-list";
import { Error } from "@/components/ui/error";
import { useProducts } from "@/lib/hooks/use-products";

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    type: "all",
    status: "all-status"
  });
  const searchParams = useSearchParams();
  const manufacturerId = searchParams.get('manufacturer');
  const isViewingManufacturer = !!manufacturerId;

  const handleFilterChange = (key: 'type' | 'status', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const { products, isLoading, error } = useProducts(manufacturerId || undefined);

  const filteredProducts = products.filter((product) => {
    // Filter by search term
    const searchTerm = searchParams.get("search");
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by type
    if (filters.type !== "all" && product.product_type !== filters.type) {
      return false;
    }

    // Filter by status
    if (filters.status !== "all-status" && product.status !== filters.status) {
      return false;
    }

    return true;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <ProductHeader onFilterChange={handleFilterChange} />
        <Error 
          title="Error Loading Products"
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductHeader onFilterChange={handleFilterChange} />
      <ProductList filters={filters} isViewingManufacturer={isViewingManufacturer} products={filteredProducts} isLoading={isLoading} />
    </div>
  );
}
