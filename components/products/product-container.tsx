"use client";

import { Product } from "@/lib/types/product";
import { BatteryProductDetails } from "./battery-product-details";
import { TextileProductDetails } from "./textile-product-details";

interface ProductContainerProps {
  product: Product;
}

export function ProductContainer({ product }: ProductContainerProps) {
  if (product.product_type === "battery") {
    return <BatteryProductDetails product={product} />;
  }

  if (product.product_type === "textile" || product.product_type === "jeans") {
    return <TextileProductDetails product={product} />;
  }

  return (
    <div className="text-center p-8">
      <p className="text-muted-foreground">
        DPP layout not available for product type: {product.product_type}
      </p>
    </div>
  );
}