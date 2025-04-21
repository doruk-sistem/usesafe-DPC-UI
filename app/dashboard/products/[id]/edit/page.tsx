import { ProductEdit } from "@/components/dashboard/products/product-edit";

interface ProductEditPageProps {
  params: {
    id: string;
  };
  searchParams: {
    reupload?: string;
  };
}

export default function ProductEditPage({ params, searchParams }: ProductEditPageProps) {
  return (
    <div className="container mx-auto py-6">
      <ProductEdit 
        productId={params.id} 
        reuploadDocumentId={searchParams.reupload}
      />
    </div>
  );
} 