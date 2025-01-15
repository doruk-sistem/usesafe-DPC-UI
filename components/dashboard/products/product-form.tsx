"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import type { NewProduct, DPPSection } from "@/lib/types/product";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { DPPConfigStep } from "./steps/DPPConfigStep";

const materialValueSchema = z.object({
  percentage: z.number(),
  recyclable: z.boolean(),
  description: z.string()
});

const certificationValueSchema = z.object({
  issuedBy: z.string(),
  validUntil: z.string(),
  status: z.enum(['valid', 'expired']),
  documentUrl: z.string().optional()
});

const dppFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['text', 'number', 'date', 'select', 'multiselect', 'material', 'certification']),
  required: z.boolean(),
  value: z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
    materialValueSchema,
    certificationValueSchema
  ]).optional(),
  options: z.array(z.string()).optional()
});

const dppSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  fields: z.array(dppFieldSchema),
  required: z.boolean(),
  order: z.number()
});

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Product description is required"),
  product_type: z.string().min(1, "Product type is required"),
  model: z.string().min(1, "Product model is required"),
  images: z.array(z.object({
    url: z.string().optional(),
    alt: z.string(),
    is_primary: z.boolean()
  })).default([]),
  key_features: z.array(z.object({
    name: z.string(),
    value: z.string(),
    unit: z.string().optional()
  })).default([]),
  dpp_config: z.object({
    sections: z.array(dppSectionSchema),
    lastUpdated: z.string()
  }).optional(),
});

interface ProductFormProps {
  onSubmit: (data: NewProduct) => Promise<void>;
  defaultValues?: Partial<NewProduct>;
}

// Default available DPP sections
const defaultAvailableSections: DPPSection[] = [
  {
    id: "materials",
    title: "Material Composition",
    fields: [
      { id: "material-name", name: "Material Name", type: "text", required: true },
      { id: "percentage", name: "Percentage", type: "number", required: true },
      { id: "recyclable", name: "Recyclable", type: "select", required: false, options: ["Yes", "No"] }
    ],
    required: false,
    order: 1
  },
  {
    id: "environmental",
    title: "Environmental Footprint",
    fields: [
      { id: "carbon-footprint", name: "Carbon Footprint", type: "number", required: true },
      { id: "energy-consumption", name: "Energy Consumption", type: "number", required: true },
      { id: "water-usage", name: "Water Usage", type: "number", required: false }
    ],
    required: false,
    order: 2
  },
  {
    id: "recycling",
    title: "Recycling & Disposal",
    fields: [
      { id: "recycling-instructions", name: "Recycling Instructions", type: "text", required: true },
      { id: "disposal-method", name: "Disposal Method", type: "select", required: true, options: ["Recycle", "Special Waste", "General Waste"] }
    ],
    required: false,
    order: 3
  },
  {
    id: "supply-chain",
    title: "Supply Chain Information",
    fields: [
      { id: "supplier", name: "Supplier", type: "text", required: true },
      { id: "origin", name: "Country of Origin", type: "text", required: true },
      { id: "transportation", name: "Transportation Method", type: "select", required: false, options: ["Sea", "Air", "Land"] }
    ],
    required: false,
    order: 4
  }
];

// Required DPP sections that cannot be removed
const requiredSections: DPPSection[] = [
  {
    id: "basic-info",
    title: "Basic Information",
    fields: [
      { id: "name", name: "Product Name", type: "text", required: true },
      { id: "type", name: "Product Type", type: "text", required: true },
      { id: "description", name: "Description", type: "text", required: true }
    ],
    required: true,
    order: 0
  },
  {
    id: "manufacturing",
    title: "Manufacturing Details",
    fields: [
      { id: "serial-number", name: "Serial Number", type: "text", required: true },
      { id: "manufacturing-date", name: "Manufacturing Date", type: "date", required: true },
      { id: "facility", name: "Manufacturing Facility", type: "text", required: true }
    ],
    required: true,
    order: 1
  }
];

export function ProductForm({ onSubmit, defaultValues }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedSections, setSelectedSections] = useState<DPPSection[]>(requiredSections);
  const [availableSections] = useState<DPPSection[]>(defaultAvailableSections);

  const form = useForm<NewProduct>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      product_type: "",
      model: "",
      images: [],
      key_features: []
    },
  });

  const progress = (step / 2) * 100;

  const handleSubmit = async (data: NewProduct) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        dpp_config: {
          sections: selectedSections.map(section => ({
            id: section.id,
            title: section.title,
            fields: section.fields,
            required: section.required,
            order: section.order
          })),
          lastUpdated: new Date().toISOString()
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    form.trigger().then((isValid) => {
      if (isValid) {
        setStep(2);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Progress value={progress} className="mb-8" />

        {step === 1 && <BasicInfoStep form={form} />}
        {step === 2 && (
          <DPPConfigStep
            form={form}
            availableSections={availableSections}
            selectedSections={selectedSections}
            onSectionsChange={setSelectedSections}
          />
        )}

        <div className="flex justify-end gap-4">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          {step === 1 ? (
            <Button type="button" onClick={handleNextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" /> 
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <span className="mr-2">Saving...</span>}
              {defaultValues ? "Update Product" : "Create Product"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}