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
    // First, let's check if the products table exists and what columns it has
    const { data: tableInfo, error: tableError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error("Error checking products table:", tableError);
      throw new Error(`Database error: ${tableError.message}`);
    }
    
    // Fetch products with their documents
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id, 
        name, 
        documents,
        manufacturer_id
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error(`Error fetching products: ${error.message}`);
    }

    // Fetch manufacturers separately
    let manufacturerMap = new Map();
    try {
      const { data: manufacturers, error: manufacturersError } = await supabase
        .from("manufacturers")
        .select("id, name");
        
      if (manufacturersError) {
        console.error("Error fetching manufacturers:", manufacturersError);
        // Continue without manufacturers
      } else if (manufacturers) {
        manufacturers.forEach(mfr => {
          manufacturerMap.set(mfr.id, mfr.name);
        });
      }
    } catch (error) {
      console.error("Error accessing manufacturers table:", error);
      // Continue without manufacturers
    }

    // Extract documents from products
    const allDocuments = products.flatMap((product) => {
      console.log("Processing product:", product.id);
      console.log("Product documents structure:", JSON.stringify(product.documents, null, 2));
      const documents: any[] = [];

      if (!product.documents) {
        console.log("No documents found for product:", product.id);
        return [];
      }

      // Handle array of documents
      if (Array.isArray(product.documents)) {
        console.log("Documents is an array");
        product.documents.forEach((doc) => {
          if (doc && doc.id) {
            documents.push({
              ...doc,
              type: doc.type || "unknown",
              status: doc.status || "pending",
              productId: product.id,
              manufacturer: product.manufacturer_id ? manufacturerMap.get(product.manufacturer_id) || "" : "",
              manufacturerId: product.manufacturer_id || "",
            });
          }
        });
      }
      // Handle object of document arrays
      else if (typeof product.documents === "object" && product.documents !== null) {
        console.log("Documents is an object");
        Object.entries(product.documents).forEach(([docType, docList]) => {
          if (Array.isArray(docList)) {
            console.log(`Processing ${docType} documents:`, docList);
            docList.forEach((doc) => {
              // Generate an ID if it doesn't exist
              const documentId = doc.id || `${docType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              
              documents.push({
                ...doc,
                id: documentId,
                type: docType,
                status: doc.status || "pending",
                productId: product.id,
                manufacturer: product.manufacturer_id ? manufacturerMap.get(product.manufacturer_id) || "" : "",
                manufacturerId: product.manufacturer_id || "",
              });
            });
          }
        });
      }
      
      console.log("Extracted documents for product:", product.id, "Count:", documents.length);
      return documents;
    });

    console.log("Total documents found:", allDocuments.length);
    console.log("Sample document structure:", JSON.stringify(allDocuments[0], null, 2));

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

        <DocumentList initialDocuments={filteredDocuments} productId={searchParams.product} />
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