import { notFound } from "next/navigation";
import { ProductContainer } from "@/components/products/product-container";
import { products } from "@/lib/data/products";
import { textileProducts } from "@/lib/data/textile-products";

const allProducts = [...products, ...textileProducts];

export async function generateStaticParams() {
  return allProducts.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const product = allProducts.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-10">
      <ProductContainer product={product} />
    </div>
  );
}
