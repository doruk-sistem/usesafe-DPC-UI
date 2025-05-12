"use client";

import { useParams } from "next/navigation";

import { ProductContainer } from "@/components/products/product-container";
import { useProduct } from "@/lib/hooks/use-product";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { product, isLoading, error } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-red-600">{error.message}</h1>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Ürün bulunamadı</h1>
        <p className="mt-2 text-gray-600">ID: {productId}</p>
      </div>
    );
  }

  return <ProductContainer product={product} />;
}
