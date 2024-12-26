import { DPPTemplateService } from "@/lib/services/dpp-template";
import { DPPTemplatePreview } from "@/components/admin/templates/template-preview";
import { Card } from "@/components/ui/card";

// Generate static params for all templates
export async function generateStaticParams() {
  try {
    const templates = await DPPTemplateService.getTemplates();
    return templates.map((template) => ({
      id: template.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default function TemplatePreviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Template Preview</h1>
        <p className="text-sm text-muted-foreground">
          Preview how the template will appear to users
        </p>
      </div>

      <Card className="p-6">
        <DPPTemplatePreview templateId={params.id} />
      </Card>
    </div>
  );
}