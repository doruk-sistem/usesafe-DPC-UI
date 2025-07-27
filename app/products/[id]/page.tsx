"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { ProductContainer } from "@/components/products/product-container";
import { Error } from "@/components/ui/error";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProduct } from "@/lib/hooks/use-product";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { isLoading: isAuthLoading, isCompanyLoading } = useAuth();
  const { product, isLoading: isProductLoading, error } = useProduct(productId);
  const t = useTranslations("products");

  const isOverallLoading = isAuthLoading || isCompanyLoading || isProductLoading;
  
  // Show loading if auth, company, or product data is still loading
  if (isOverallLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading text={t("productLoading")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Error error={error} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Error 
          title={t("productNotFound")} 
          message={t("productNotFoundDescription", { productId })} 
        />
      </div>
    );
  }

  return <ProductContainer product={product} />;
}
