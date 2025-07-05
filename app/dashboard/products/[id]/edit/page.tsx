import { ProductEdit } from "@/components/dashboard/products/product-edit";

interface ProductEditPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    reupload?: string;
  }>;
}

export default async function ProductEditPage({ params, searchParams }: ProductEditPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <div className="container mx-auto py-6">
      <ProductEdit 
        productId={resolvedParams.id} 
        reuploadDocumentId={resolvedSearchParams.reupload}
      />
    </div>
  );
} 