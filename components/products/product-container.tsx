"use client";

import { useTranslations } from 'next-intl';
import { Product } from "@/lib/types/product";

import { BatteryProductDetails } from "./battery-product-details";
import { TextileProductDetails } from "./textile-product-details";

interface ProductContainerProps {
  product: Product;
}

export function ProductContainer({ product }: ProductContainerProps) {
  const t = useTranslations('product');

  if (product.product_type === "battery") {
    return <BatteryProductDetails product={product} />;
  }

  if (product.product_type === "textile" || product.product_type === "jeans") {
    return <TextileProductDetails product={product} />;
  }

  return (
    <div className="text-center p-8">
      <p className="text-muted-foreground">
        {t('details.notAvailable')}
      </p>
    </div>
  );
}
