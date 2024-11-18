import { TemplatePreview } from "@/components/admin/system/template-preview";

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

export default function TemplatePreviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <TemplatePreview templateId={params.id} />
    </div>
  );
}