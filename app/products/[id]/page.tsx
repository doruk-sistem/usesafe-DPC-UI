import { notFound } from "next/navigation";

import { products } from "@/lib/data/products";
import { ProductContainer } from "@/components/products/product-container";

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-10">
      <ProductContainer product={product} />
    </div>
  );
}