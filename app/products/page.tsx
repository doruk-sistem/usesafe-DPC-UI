import { Box, QrCode, History, ShieldCheck } from "lucide-react";

import { ProductList } from "@/components/products/product-list";

export default function ProductsPage() {
  return (
    <div className="container px-6 md:px-8 mx-auto py-10">
      <div className="flex flex-col items-center text-center mb-12">
        <Box className="h-16 w-16 text-primary mb-6" />
        <h1 className="text-4xl font-bold mb-4">Certified Products</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mb-8">
          Explore our collection of certified sustainable products with verified Digital Product Passports.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-12">
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
            <QrCode className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Product Traceability</h3>
            <p className="text-sm text-muted-foreground text-center">
              Track product journey from source to store
            </p>
          </div>
          
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
            <History className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Supply Chain History</h3>
            <p className="text-sm text-muted-foreground text-center">
              Complete transparency of product lifecycle
            </p>
          </div>
          
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
            <ShieldCheck className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Verified Certifications</h3>
            <p className="text-sm text-muted-foreground text-center">
              Authenticated sustainability credentials
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">Featured Products</h2>
        <p className="text-muted-foreground">
          Browse our selection of certified sustainable products from e-bebek
        </p>
      </div>

      <ProductList />
    </div>
  );
}