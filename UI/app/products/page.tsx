import { ProductList } from "@/components/products/product-list";
import { Box } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col items-center text-center mb-10">
        <Box className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Certified Products</h1>
        <p className="text-muted-foreground max-w-2xl">
          Browse our collection of certified sustainable products with verified Digital Product Passports.
        </p>
      </div>

      <ProductList />
    </div>
  );
}