"use client";

import { useTranslations } from "next-intl";

import { BaseProduct } from "@/lib/types/product";

import { CategoryDetails } from "./category-details";
import { ProductDetails } from "./product-details";

interface ProductContainerProps {
  product: BaseProduct;
}

export function ProductContainer({ product }: ProductContainerProps) {
  return (
    <ProductDetails 
      product={product}
      additionalComponents={<CategoryDetails product={product} />}
    />
  );
}
