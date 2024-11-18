import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock data - In a real app, this would come from an API
const templatesData = {
  "TPL-001": {
    id: "TPL-001",
    name: "Textile Product Certificate",
    fields: [
      { id: "f1", name: "productName", label: "Product Name", type: "text", required: true },
      { id: "f2", name: "manufacturer", label: "Manufacturer", type: "text", required: true },
      { id: "f3", name: "materials", label: "Materials", type: "textarea", required: true },
      { id: "f4", name: "certifications", label: "Certifications", type: "multiselect", required: true },
    ],
  },
};

interface TemplatePreviewProps {
  templateId: string;
}

export function TemplatePreview({ templateId }: TemplatePreviewProps) {
  const template = templatesData[templateId];

  if (!template) {
    return <div>Template not found</div>;
  }

  const renderField = (field: any) => {
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.id}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className="resize-none"
          />
        );
      case "multiselect":
        return (
          <div className="flex flex-wrap gap-2">
            <Badge>Sample Certificate 1</Badge>
            <Badge>Sample Certificate 2</Badge>
            <Badge variant="outline">+ Add More</Badge>
          </div>
        );
      default:
        return (
          <Input
            id={field.id}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/system/templates/${templateId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Template Preview</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">{template.name}</h2>
              <p className="text-sm text-muted-foreground">
                Preview how the template will appear to users
              </p>
            </div>

            <div className="space-y-4">
              {template.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}