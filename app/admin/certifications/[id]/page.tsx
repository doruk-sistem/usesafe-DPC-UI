import { CertificationDetails } from "@/components/admin/certifications/certification-details";
import { CertificationDocuments } from "@/components/admin/certifications/certification-documents";
import { CertificationTests } from "@/components/admin/certifications/certification-tests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for static params
const certifications = [
  { id: "DPC-001" },
  { id: "DPC-002" },
  { id: "DPC-003" },
];

export function generateStaticParams() {
  return certifications.map((certification) => ({
    id: certification.id,
  }));
}

export default function CertificationPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <CertificationDetails certificationId={params.id} />
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="tests">Test Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="documents" className="space-y-4">
          <CertificationDocuments certificationId={params.id} />
        </TabsContent>
        <TabsContent value="tests" className="space-y-4">
          <CertificationTests certificationId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}