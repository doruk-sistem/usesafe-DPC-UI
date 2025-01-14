import { products } from "@/lib/data/products";
import { textileProducts } from "@/lib/data/textile-products";
import { BatteryProductDetails } from "@/components/products/battery-product-details";
import { TextileProductDetails } from "@/components/products/textile-product-details";

export async function generateStaticParams() {
  const allProducts = [...products, ...textileProducts];
  return allProducts.map((product) => ({
    id: product.id,
  }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const allProducts = [...products, ...textileProducts];
  const product = allProducts.find((p) => p.id === params.id);

  if (!product) {
    return <div>Product not found</div>;
  }

  // Determine which product details component to render based on product type
  if (product.product_type === "battery") {
    return <BatteryProductDetails product={product} />;
  } else {
    return <TextileProductDetails product={product} />;
  }
}