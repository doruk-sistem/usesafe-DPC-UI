import { DocumentDetails } from "@/components/admin/documents/document-details";
import { DocumentHistory } from "@/components/admin/documents/document-history";
import { DocumentValidation } from "@/components/admin/documents/document-validation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for static params
const documents = [
  { id: "DOC-001" },
  { id: "DOC-002" },
  { id: "DOC-003" },
  { id: "DOC-004" },
];

export function generateStaticParams() {
  return documents.map((document) => ({
    id: document.id,
  }));
}

export default async function DocumentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <div className="space-y-6">
      <DocumentDetails documentId={params.id} />
      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="validation" className="space-y-4">
          <DocumentValidation documentId={params.id} />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <DocumentHistory documentId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}