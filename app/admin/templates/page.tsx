"use client";

import { useDPPTemplates } from "@/lib/hooks/use-dpp-templates";
import { TemplateMetrics } from "@/components/admin/templates/template-metrics";
import { DPPTemplateList } from "@/components/admin/templates/template-list";
import { DPPTemplateHeader } from "@/components/admin/templates/template-header";

export default function DPPTemplatesPage() {
  const { templates } = useDPPTemplates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">DPP Templates</h1>
        <p className="text-sm text-muted-foreground">
          Manage Digital Product Passport templates for different product types
        </p>
      </div>
      <TemplateMetrics templates={templates} />
      <DPPTemplateHeader />
      <DPPTemplateList />
    </div>
  );
}