"use client";

import { DPPTemplateForm } from "@/components/admin/templates/template-form";
import { Card } from "@/components/ui/card";

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create DPP Template</h1>
        <p className="text-sm text-muted-foreground">
          Configure a new template for product type
        </p>
      </div>

      <Card className="p-6">
        <DPPTemplateForm />
      </Card>
    </div>
  );
}