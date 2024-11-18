import { DocumentList } from "@/components/admin/documents/document-list";
import { DocumentHeader } from "@/components/admin/documents/document-header";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <DocumentHeader />
      <DocumentList />
    </div>
  );
}