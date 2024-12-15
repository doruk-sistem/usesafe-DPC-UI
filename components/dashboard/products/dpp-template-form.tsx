"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { DPPTemplate } from "@/lib/types/database";

const templateSchema = z.object({
  hazard_pictograms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    image_url: z.string().url(),
    description: z.string()
  })),
  materials: z.array(z.object({
    name: z.string(),
    percentage: z.number().min(0).max(100),
    cas_number: z.string().optional(),
    hazard_level: z.string().optional(),
    recyclable: z.boolean()
  })),
  health_safety_measures: z.array(z.object({
    category: z.string(),
    measures: z.array(z.string())
  })),
  emergency_procedures: z.array(z.object({
    scenario: z.string(),
    steps: z.array(z.string())
  })),
  storage_installation_guidelines: z.array(z.object({
    category: z.string(),
    guidelines: z.array(z.string())
  })),
  required_certifications: z.array(z.string()),
  optional_certifications: z.array(z.string())
});

interface DPPTemplateFormProps {
  onSubmit: (data: Partial<DPPTemplate>) => Promise<void>;
  defaultValues?: Partial<DPPTemplate>;
}

export function DPPTemplateForm({ onSubmit, defaultValues }: DPPTemplateFormProps) {
  const form = useForm<Partial<DPPTemplate>>({
    resolver: zodResolver(templateSchema),
    defaultValues: defaultValues || {
      hazard_pictograms: [],
      materials: [],
      health_safety_measures: [],
      emergency_procedures: [],
      storage_installation_guidelines: [],
      required_certifications: [],
      optional_certifications: []
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Hazard Pictograms Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Hazard Pictograms</h3>
          {/* Add dynamic form fields for hazard pictograms */}
        </Card>

        {/* Materials Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Materials</h3>
          {/* Add dynamic form fields for materials */}
        </Card>

        {/* Health & Safety Measures Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Health & Safety Measures</h3>
          {/* Add dynamic form fields for health & safety measures */}
        </Card>

        {/* Emergency Procedures Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Emergency Procedures</h3>
          {/* Add dynamic form fields for emergency procedures */}
        </Card>

        {/* Storage & Installation Guidelines Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Storage & Installation Guidelines</h3>
          {/* Add dynamic form fields for storage & installation guidelines */}
        </Card>

        {/* Certifications Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Certifications</h3>
          {/* Add dynamic form fields for certifications */}
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Save Template</Button>
        </div>
      </form>
    </Form>
  );
}