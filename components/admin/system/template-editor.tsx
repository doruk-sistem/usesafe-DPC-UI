import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Mock data - In a real app, this would come from an API
const templatesData = {
  "TPL-001": {
    id: "TPL-001",
    name: "Textile Product Certificate",
    category: "Certification",
    version: "2.1",
    description: "Standard template for textile product certification",
    fields: [
      { id: "f1", name: "productName", label: "Product Name", type: "text", required: true },
      { id: "f2", name: "manufacturer", label: "Manufacturer", type: "text", required: true },
      { id: "f3", name: "materials", label: "Materials", type: "textarea", required: true },
      { id: "f4", name: "certifications", label: "Certifications", type: "multiselect", required: true },
    ],
    status: "active",
  },
};

interface TemplateEditorProps {
  templateId: string;
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const template = templatesData[templateId];

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/system">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to System
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Edit Template</h1>
          <Badge
            variant={template.status === "active" ? "success" : "secondary"}
          >
            {template.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                defaultValue={template.name}
                placeholder="Enter template name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue={template.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Certification">Certification</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="Care">Care Instructions</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue={template.description}
                placeholder="Enter template description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                defaultValue={template.version}
                placeholder="Enter version number"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {template.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <div className="flex gap-2">
                  <Input
                    id={field.id}
                    defaultValue={field.label}
                    className="flex-1"
                  />
                  <Select defaultValue={field.type}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Field type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Text Area</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="multiselect">Multi Select</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="shrink-0">
                    Required
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Add Field
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}