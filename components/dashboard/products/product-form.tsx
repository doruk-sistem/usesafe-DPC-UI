"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import type { NewProduct } from "@/lib/types/product";

import { BasicInfoStep } from "./steps/BasicInfoStep";
import { DocumentUploadStep } from "./steps/DocumentUploadStep";
import { ManufacturerSelect } from "./steps/manufacturerSelect/ManufacturerSelect";

const certificationValueSchema = z.object({
  issuedBy: z.string(),
  validUntil: z.string(),
  status: z.enum(["valid", "expired"]),
  documentUrl: z.string().optional(),
});

const documentSchema = z.object({
  quality_cert: z.array(z.string()).optional(),
  safety_cert: z.array(z.string()).optional(),
  test_reports: z.array(z.string()).optional(),
  technical_docs: z.array(z.string()).optional(),
  compliance_docs: z.array(z.string()).optional(),
});

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Product description is required"),
  product_type: z.string().min(1, "Product type is required"),
  model: z.string().min(1, "Product model is required"),
  images: z
    .array(
      z.object({
        url: z.string().optional(),
        alt: z.string(),
        is_primary: z.boolean(),
        fileObject: z.any().optional(),
      })
    )
    .default([]),
  key_features: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        unit: z.string().optional(),
      })
    )
    .default([]),
  documents: documentSchema.optional(),
  manufacturer_id: z.string(),
});

type FormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: NewProduct) => Promise<void>;
  defaultValues?: Partial<FormData>;
}

export function ProductForm({
  onSubmit,
  defaultValues,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      product_type: "",
      model: "",
      images: [],
      key_features: [],
      documents: {},
      manufacturer_id: "",
    },
  });

  const progress = (step / 4) * 100;

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const productData: NewProduct = {
        ...data,
        name: data.name || "",
        description: data.description || "",
        product_type: data.product_type || "",
        model: data.model || "",
        company_id: "",
        manufacturer_id: data.manufacturer_id || "",
        images: data.images.map((img) => ({
          url: img.url || "",
          alt: img.alt || "",
          is_primary: img.is_primary || false,
          fileObject: img.fileObject || undefined,
        })),
        key_features: data.key_features.map((feature) => ({
          name: feature.name || "",
          value: feature.value || "",
          unit: feature.unit,
        })),
      };
      await onSubmit(productData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    form.trigger().then((isValid) => {
      if (isValid) {
        setStep(step + 1);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Progress value={progress} className="mb-8" />

        {step === 1 && <BasicInfoStep form={form as any} />}
        {step === 2 && <DocumentUploadStep form={form as any} />}
        {step === 3 && (
          <ManufacturerSelect form={form as any} />
        )}

        <div className="flex justify-end gap-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          {step < 3 ? (
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
