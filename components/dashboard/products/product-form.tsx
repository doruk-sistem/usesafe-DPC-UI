"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { DOCUMENT_TYPES, REQUIRED_DOCUMENTS } from "@/lib/constants/documents";
import type { NewProduct } from "@/lib/types/product";

import { BasicInfoStep } from "./steps/BasicInfoStep";
import { DocumentUploadStep } from "./steps/DocumentUploadStep";
import { ManufacturerSelect } from "./steps/manufacturerSelect/ManufacturerSelect";

const documentSchema = z.object({
  quality_cert: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
      })
    )
    .optional(),
  safety_cert: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
      })
    )
    .optional(),
  test_reports: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
      })
    )
    .optional(),
  technical_docs: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
      })
    )
    .optional(),
  compliance_docs: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
      })
    )
    .optional(),
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
        alt: z.string().optional(),
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
  manufacturer_id: z.string().optional(),
});

type FormData = z.infer<typeof productSchema> & {
  documents_confirmed?: boolean;
};

interface ProductFormProps {
  onSubmit: (data: NewProduct) => Promise<void>;
  defaultValues?: Partial<FormData>;
}

const TOTAL_STEPS = 3;

export function ProductForm({ onSubmit, defaultValues }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [validateDocuments, setValidateDocuments] = useState<() => boolean>(
    () => true
  );
  const [missingDocuments, setMissingDocuments] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      product_type: "",
      model: "",
      images: [],
      key_features: [],
      documents: undefined,
      manufacturer_id: "",
    },
  });

  const progress = (step / TOTAL_STEPS) * 100;

  const validateRequiredDocuments = useCallback(() => {
    const productType = form.getValues("product_type");
    if (!productType) return true;

    const normalizedType = productType.toLowerCase().replace(/\s+|-/g, "_");

    const requiredDocs =
      REQUIRED_DOCUMENTS[normalizedType] ||
      REQUIRED_DOCUMENTS[productType.toUpperCase()] ||
      REQUIRED_DOCUMENTS[productType];

    if (!requiredDocs) {
      return true;
    }

    const formDocs = form.getValues("documents") || {};
    const missingDocs = DOCUMENT_TYPES.filter((doc) => requiredDocs[doc.id])
      .filter((doc) => !formDocs[doc.id]?.length)
      .map((doc) => doc.label);

    if (missingDocs.length > 0) {
      setMissingDocuments(missingDocs);
      return false;
    }

    setMissingDocuments([]);
    return true;
  }, [form, setMissingDocuments]);

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const { documents_confirmed, ...submitData } = data;
      await onSubmit({
        ...submitData,
        name: submitData.name || "",
        description: submitData.description || "",
        product_type: submitData.product_type || "",
        model: submitData.model || "",
        company_id: "",
        manufacturer_id: submitData.manufacturer_id || "",
        images: submitData.images.map((img) => ({
          url: img.url || "",
          alt: img.alt || "",
          is_primary: img.is_primary || false,
          fileObject: img.fileObject || undefined,
        })),
        key_features: submitData.key_features.map((feature) => ({
          name: feature.name || "",
          value: feature.value || "",
          unit: feature.unit,
        })),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (step !== 2) {
      const isValid = await form.trigger();
      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields correctly",
          variant: "destructive",
        });
        return;
      }
      setStep(step + 1);
      return;
    }

    try {
      const isValid = await form.trigger();
      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields correctly",
          variant: "destructive",
        });
        return;
      }

      const productType = form.getValues("product_type");

      const normalizedType = productType?.toLowerCase().replace(/\s+|-/g, "_");

      const requiredConfig =
        REQUIRED_DOCUMENTS[normalizedType] ||
        REQUIRED_DOCUMENTS[productType?.toUpperCase()] ||
        REQUIRED_DOCUMENTS[productType];

      if (requiredConfig) {
        const uploadedDocs = form.getValues("documents") || {};

        const missingDocs = DOCUMENT_TYPES.filter((docType) => {
          const isRequired = requiredConfig[docType.id];
          const hasDoc = uploadedDocs[docType.id]?.length > 0;

          return isRequired && !hasDoc;
        }).map((doc) => doc.label);

        if (missingDocs.length > 0) {
          toast({
            title: "Required Documents Missing",
            description: `Please upload: ${missingDocs.join(", ")}`,
            variant: "destructive",
          });
          return;
        }
      }

      const documentsConfirmed = form.getValues("documents_confirmed");
      if (!documentsConfirmed) {
        toast({
          title: "Document Confirmation Required",
          description: "Please confirm the accuracy of the uploaded documents",
          variant: "destructive",
        });
        return;
      }

      setStep(step + 1);
    } catch (error) {
      console.error("Error in handleNextStep:", error);
      toast({
        title: "Error",
        description: "An error occurred while validating documents",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Progress value={progress} className="mb-8" />

        {step === 1 && <BasicInfoStep form={form as any} />}

        {step === 2 && (
          <DocumentUploadStep
            form={form}
            setValidationFunction={setValidateDocuments}
            onNext={() => setStep(step + 1)}
          />
        )}

        {step === 3 && <ManufacturerSelect form={form} />}

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

          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
            >
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
