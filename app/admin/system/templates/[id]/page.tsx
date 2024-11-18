import { TemplateEditor } from "@/components/admin/system/template-editor";
import { TemplatePreview } from "@/components/admin/system/template-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for static params
const templates = [
  { id: "TPL-001" },
  { id: "TPL-002" },
  { id: "TPL-003" },
];

export function generateStaticParams() {
  return templates.map((template) => ({
    id: template.id,
  }));
}

export default function TemplatePage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <TemplateEditor templateId={params.id} />
      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="space-y-4">
          <TemplatePreview templateId={params.id} />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          {/* Template History Component */}
        </TabsContent>
      </Tabs>
    </div>
  );
}