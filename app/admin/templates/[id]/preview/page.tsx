import { notFound } from 'next/navigation';

import { DPPTemplatePreview } from "@/components/admin/templates/template-preview";
import { Card } from "@/components/ui/card";
import { DPPTemplateService } from "@/lib/services/dpp-template";

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

// Get template data for the page
async function getTemplate(id: string) {
  try {
    const template = await DPPTemplateService.getTemplate(id);
    if (!template) {
      return null;
    }
    return template;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

export default async function TemplatePreviewPage({ params }: { params: { id: string } }) {
  const template = await getTemplate(params.id);

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Template Preview</h1>
        <p className="text-sm text-muted-foreground">
          Preview how the template will appear to users
        </p>
      </div>

      <Card className="p-6">
        <DPPTemplatePreview template={template} />
      </Card>
    </div>
  );
}