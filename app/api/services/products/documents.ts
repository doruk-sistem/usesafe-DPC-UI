import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getProductDocuments(productId?: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

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
    throw new Error(`Error fetching products: ${productsError.message}`);
  }

  const allDocuments = products.flatMap((product) => {
    if (!product.documents) return [];

    const documents: any[] = [];
    Object.entries(product.documents).forEach(([docType, docList]) => {
      if (Array.isArray(docList)) {
        docList.forEach((doc) => {
          if (doc) {
            const documentId = doc.id || `${docType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            documents.push({
              ...doc,
              id: documentId,
              type: docType,
              status: doc.status || "pending",
              productId: product.id,
              productName: product.name || "",
              manufacturerId: product.manufacturer_id,
              manufacturer: "Unknown",
            });
          }
        });
      }
    });
    return documents;
  });

  return productId 
    ? allDocuments.filter((doc) => doc.productId === productId)
    : allDocuments;
}