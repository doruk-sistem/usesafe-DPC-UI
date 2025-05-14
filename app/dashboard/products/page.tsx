"use client";

import { useState, useMemo } from "react";

import { ProductHeader } from "@/components/dashboard/products/product-header";
import { ProductList } from "@/components/dashboard/products/product-list";
import { Error } from "@/components/ui/error";
import { useProducts } from "@/lib/hooks/use-products";

export default function ProductsPage() {
  const { products, isLoading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all-status");

  // Filtreleme ve arama işlemleri
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let result = [...products];

    // Arama filtresi
    if (searchTerm) {
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ürün tipi filtresi
    if (typeFilter !== "all") {
      result = result.filter(product => product.product_type === typeFilter);
    }

    // Durum filtresi
    if (statusFilter !== "all-status") {
      result = result.filter(product => product.status === statusFilter);
    }

    return result;
  }, [products, searchTerm, typeFilter, statusFilter]);

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
