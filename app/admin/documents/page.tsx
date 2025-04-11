import { getProductDocuments } from "@/app/api/services/products/documents";
import { DocumentHeader } from "@/components/admin/documents/document-header";
import { DocumentList } from "@/components/admin/documents/document-list";

export const dynamic = "force-dynamic";

interface DocumentsPageProps {
  searchParams: {
    product?: string;
  };
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  try {
    const documents = await getProductDocuments(searchParams.product);

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
        <DocumentHeader />
        <DocumentList initialDocuments={documents} />
      </div>
    );
  } catch (error) {
    console.error("Error in DocumentsPage:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-semibold text-destructive">
          Error Loading Documents
        </h2>
        <p className="text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
      </div>
    );
  }
}
