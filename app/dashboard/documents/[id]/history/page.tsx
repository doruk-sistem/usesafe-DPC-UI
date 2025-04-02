import { DocumentHistory } from "@/components/dashboard/documents/document-history";

interface DocumentHistoryPageProps {
  params: {
    id: string;
  };
}

export default function DocumentHistoryPage({ params }: DocumentHistoryPageProps) {
  return (
    <div className="container mx-auto py-6">
      <DocumentHistory documentId={params.id} />
    </div>
  );
} 