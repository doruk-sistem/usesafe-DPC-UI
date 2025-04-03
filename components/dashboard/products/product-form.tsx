"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTranslations } from "next-intl";

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
  company_id: z.string().optional(),
  status: z.enum(["DRAFT", "NEW", "DELETED", "ARCHIVED"]).optional(),
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
  product_subcategory: z.string().optional(),
});

type FormData = {
  name: string;
  description: string;
  product_type: string;
  model: string;
  company_id?: string;
  status?: "DRAFT" | "NEW" | "DELETED" | "ARCHIVED";
  images: {
    url: string;
    alt?: string;
    is_primary: boolean;
    fileObject?: any;
  }[];
  key_features: {
    name: string;
    value: string;
    unit?: string;
  }[];
  documents?: {
    quality_cert?: { name: string; url: string; type: string; }[];
    safety_cert?: { name: string; url: string; type: string; }[];
    test_reports?: { name: string; url: string; type: string; }[];
    technical_docs?: { name: string; url: string; type: string; }[];
    compliance_docs?: { name: string; url: string; type: string; }[];
  };
  manufacturer_id?: string;
  product_subcategory?: string;
  documents_confirmed?: boolean;
};

interface ProductFormProps {
  onSubmit: (data: Omit<NewProduct, 'company_id'> & { company_id?: string }) => Promise<void>;
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
  const t = useTranslations("productManagement.addProduct");

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
        company_id: submitData.company_id || "",
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
          title: t("error.title"),
          description: t("form.validation.error"),
          variant: "destructive",
        });
        return;
      }
    }

    if (step === 2 && !validateDocuments()) {
      toast({
        title: t("error.title"),
        description: t("form.documents.missing", {
          documents: missingDocuments.join(", ")
        }),
        variant: "destructive",
      });
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ManufacturerSelect form={form} />;
      case 2:
        return <BasicInfoStep form={form} />;
      case 3:
        return (
          <DocumentUploadStep
            form={form}
            setValidateDocuments={setValidateDocuments}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Progress value={progress} className="h-2" />
        {renderStep()}
        <div className="flex justify-between">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("form.navigation.previous")}
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="ml-auto"
            >
              {t("form.navigation.next")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto"
            >
              {t("form.navigation.submit")}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
