import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { DocumentList } from "@/components/admin/documents/document-list";
import { DocumentStatus } from "@/lib/types/document";

interface DocumentsPageProps {
  searchParams: {
    product?: string;
  };
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  try {
    // Fetch products with their documents
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        id, 
        name, 
        documents,
        manufacturer_id
      `)
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error("Error fetching products:", productsError);
      throw new Error(`Error fetching products: ${productsError.message}`);
    }

    // Extract documents from products
    const allDocuments = products.flatMap((product) => {
      if (!product.documents) return [];

      const documents: any[] = [];
      Object.entries(product.documents).forEach(([docType, docList]) => {
        if (Array.isArray(docList)) {
          docList.forEach((doc) => {
            if (doc) {
              const documentId = doc.id || `${docType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              documents.push({
                id: documentId,
                url: doc.url || "",
                name: doc.name || "",
                type: docType,
                status: doc.status || "pending",
                rejection_reason: doc.rejectionReason || doc.rejection_reason || "",
                rejection_date: doc.rejectionDate || doc.rejection_date || null,
                productId: product.id,
                productName: product.name || "",
                manufacturerId: product.manufacturer_id || "",
                manufacturer: "Unknown", // Manufacturers tablosu olmadığı için sabit değer
                createdAt: doc.created_at || new Date().toISOString(),
                updatedAt: doc.updated_at || new Date().toISOString()
              });
            }
          });
        }
      });
      return documents;
    });

    // If a specific product is requested, filter documents for that product
    const filteredDocuments = searchParams.product 
      ? allDocuments.filter(doc => doc.productId === searchParams.product)
      : allDocuments;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Documents</h1>
            <p className="text-muted-foreground">
              {searchParams.product
                ? "View and manage documents for this product"
                : "View and manage all documents"}
            </p>
          </div>
        </div>

        <DocumentList initialDocuments={filteredDocuments} />
      </div>
    );
  } catch (error) {
    console.error("Error in DocumentsPage:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-semibold text-destructive">Error Loading Documents</h2>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
      </div>
    );
  }
}