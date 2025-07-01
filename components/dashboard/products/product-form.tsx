"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import type { NewProduct } from "@/lib/types/product";

import { BasicInfoStep } from "./steps/BasicInfoStep";
import { DocumentUploadStep } from "./steps/DocumentUploadStep";
// import { EsprComplianceStep } from "./steps/EsprComplianceStep";
import { ManufacturerSelect } from "./steps/manufacturerSelect/ManufacturerSelect";

const documentSchema = z.object({
  quality_cert: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  safety_cert: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  test_reports: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  technical_docs: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  compliance_docs: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
});

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Product description is required"),
  product_type: z.string().min(1, "Product type is required"),
  product_subcategory: z.string().min(1, "Product subcategory is required"),
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

// ✅ Tipler Birebir Eşleşti
type FormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: Partial<FormData>;
}

// ✅ Toplam Adım Sabitlendi
const TOTAL_STEPS = 3; // ESPR compliance adımı geçici olarak kaldırıldı

export function ProductForm({
  onSubmit,
  defaultValues,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const t = useTranslations();

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

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        company_id: "",
        images: data.images.map((img) => ({
          url: img.url || "",
          alt: img.alt || "",
          is_primary: img.is_primary || false,
          fileObject: img.fileObject || undefined,
        })),
        key_features: data.key_features.map(feature => ({
          name: feature.name || "",
          value: feature.value || "",
          unit: feature.unit,
        })),
        documents: data.documents,
      });
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
        {/* ✅ İlerleme Durumu */}
        <Progress value={progress} className="mb-8" />
        {/* ✅ Adım 1 */}
        {step === 1 && <BasicInfoStep form={form as any} />} 

        {/* ✅ Adım 2 */}
        {step === 2 && <DocumentUploadStep form={form as any} />}

        {/* ✅ Adım 3 */}
        {step === 3 && <ManufacturerSelect form={form} />}

        {/* ✅ Adım 4 - ESPR Uyumluluğu (Geçici olarak kaldırıldı) */}
        {/* {step === 4 && <EsprComplianceStep form={form as any} />} */}

        {/* ✅ Butonlar */}
        <div className="flex justify-end gap-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.buttons.previous")}
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
            >
              {t("common.buttons.next")}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <span className="mr-2">{t("common.buttons.saving")}</span>}
              {defaultValues ? t("common.buttons.updateProduct") : t("common.buttons.createProduct")}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
