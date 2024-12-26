"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DPPTemplateService } from "@/lib/services/dpp-template";
import type { DPPTemplate } from "@/lib/types/dpp";

interface DPPTemplatePreviewProps {
  templateId: string;
}

export function DPPTemplatePreview({ templateId }: DPPTemplatePreviewProps) {
  const [template, setTemplate] = useState<DPPTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const data = await DPPTemplateService.getTemplate(templateId);
        setTemplate(data);
      } catch (error) {
        console.error('Error loading template:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  if (isLoading) {
    return <Skeleton className="h-[400px]" />;
  }

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{template.product_type} Template</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(template.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Hazard Pictograms */}
      <Card>
        <CardHeader>
          <CardTitle>Hazard Pictograms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {template.hazard_pictograms.map((pictogram, index) => (
              <div key={index} className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <div className="relative w-16 h-16">
                  <Image
                    src={pictogram.image_url}
                    alt={pictogram.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="font-medium text-sm text-center">{pictogram.name}</p>
                <p className="text-xs text-muted-foreground text-center">
                  {pictogram.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {template.materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{material.name}</p>
                  {material.cas_number && (
                    <p className="text-sm text-muted-foreground">CAS: {material.cas_number}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{material.percentage}%</Badge>
                  {material.recyclable && (
                    <Badge variant="success">Recyclable</Badge>
                  )}
                  {material.hazard_level && (
                    <Badge variant="warning">{material.hazard_level}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health & Safety */}
      <Card>
        <CardHeader>
          <CardTitle>Health & Safety Measures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {template.health_safety_measures.map((category, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">{category.category}</h3>
                <ul className="list-disc list-inside space-y-1">
                  {category.measures.map((measure, mIndex) => (
                    <li key={mIndex} className="text-muted-foreground">
                      {measure}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Procedures */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Procedures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {template.emergency_procedures.map((procedure, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">{procedure.scenario}</h3>
                <ol className="list-decimal list-inside space-y-1">
                  {procedure.steps.map((step, sIndex) => (
                    <li key={sIndex} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Storage & Installation */}
      <Card>
        <CardHeader>
          <CardTitle>Storage & Installation Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {template.storage_installation_guidelines.map((guideline, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">{guideline.title}</h3>
                <ul className="list-disc list-inside space-y-1">
                  {guideline.items.map((item, iIndex) => (
                    <li key={iIndex} className="text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Required Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {template.required_certifications.map((cert, index) => (
                <Badge key={index} variant="default">
                  <FileText className="w-4 h-4 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optional Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {template.optional_certifications.map((cert, index) => (
                <Badge key={index} variant="secondary">
                  <FileText className="w-4 h-4 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}