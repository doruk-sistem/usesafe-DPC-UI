import { DPPTemplateService } from "@/lib/services/dpp-template";
import { DPPTemplateForm } from "@/components/admin/templates/template-form";
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

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit DPP Template</h1>
        <p className="text-sm text-muted-foreground">
          Modify template configuration for product type
        </p>
      </div>

      <Card className="p-6">
        <DPPTemplateForm templateId={params.id} />
      </Card>
    </div>
  );
}