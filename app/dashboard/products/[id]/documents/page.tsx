import { ProductDocuments } from "@/components/dashboard/products/product-documents";

interface ProductDocumentsPageProps {
  params: {
    id: string;
  };
}

export default function ProductDocumentsPage({ params }: ProductDocumentsPageProps) {
  return (
    <div className="container mx-auto py-6">
      <ProductDocuments productId={params.id} />
    </div>
  );
} 