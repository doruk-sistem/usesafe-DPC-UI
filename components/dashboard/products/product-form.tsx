"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";

import { BasicInfoStep } from "./steps/BasicInfoStep";
import { DocumentUploadStep } from "./steps/DocumentUploadStep";
import { ManufacturerSelect } from "./steps/manufacturerSelect/ManufacturerSelect";

// ✅ NewProduct Tipi
export type NewProduct = {
  company_id?: string | null; // ✅ Opsiyonel ve nullable hale getirildi
  name?: string;
  description?: string;
  product_type?: string;
  model?: string;
  images: {
    url?: string;
    alt?: string; // ✅ Opsiyonel yapıldı
    is_primary: boolean;
    fileObject?: any;
  }[];
  key_features: {
    name: string;
    value: string;
    unit?: string;
  }[];
  documents?: {
    quality_cert?: string[];
    safety_cert?: string[];
    test_reports?: string[];
    technical_docs?: string[];
    compliance_docs?: string[];
  };
  manufacturer_id?: string;
};

// ✅ Sertifika Şeması
const certificationValueSchema = z.object({
  issuedBy: z.string(),
  validUntil: z.string(),
  status: z.enum(["valid", "expired"]),
  documentUrl: z.string().optional(),
});

// ✅ Belge Şeması
const documentSchema = z.object({
  quality_cert: z.array(z.string()).optional(),
  safety_cert: z.array(z.string()).optional(),
  test_reports: z.array(z.string()).optional(),
  technical_docs: z.array(z.string()).optional(),
  compliance_docs: z.array(z.string()).optional(),
});

// ✅ Ürün Şeması (company_id nullable yapıldı)
const productSchema = z.object({
  company_id: z.string().nullable().optional(), // ✅ Nullable ve opsiyonel yapıldı
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  description: z.string().min(5, "Product description is required").optional(),
  product_type: z.string().min(1, "Product type is required").optional(),
  model: z.string().min(1, "Product model is required").optional(),
  images: z
    .array(
      z.object({
        url: z.string().optional(),
        alt: z.string().optional(), // ✅ Opsiyonel yapıldı
        is_primary: z.boolean(),
        fileObject: z.any().optional(),
      })
    )
    .default([]), // ✅ Varsayılan değer boş dizi
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
  onSubmit: (data: NewProduct) => Promise<void>;
  defaultValues?: Partial<FormData>;
}

// ✅ Toplam Adım Sabitlendi
const TOTAL_STEPS = 3;

export function ProductForm({
  onSubmit,
  defaultValues,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // ✅ `useForm` içinde tipler eşleşti
  const form = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || {
      company_id: null, // ✅ Null olarak başlatıldı
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

  // ✅ Gönderim Fonksiyonu
  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        company_id: data.company_id || undefined,
        images: data.images.map(image => ({
          ...image,
          is_primary: image.is_primary ?? false,
        })),
        key_features: data.key_features.map(feature => ({
          ...feature,
          name: feature.name || "", // Ensure name is set
          value: feature.value || "", // Ensure value is set
        })),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Adım Değişim Kontrolü
  const handleStepChange = async (nextStep: number) => {
    const isValid = await form.trigger(); // ✅ Doğrulama yapıldı
    if (isValid) setStep(nextStep);
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

        {/* ✅ Butonlar */}
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
              onClick={() => handleStepChange(step + 1)}
              disabled={isSubmitting}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : defaultValues ? "Update Product" : "Create Product"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
