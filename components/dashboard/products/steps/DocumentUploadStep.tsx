"use client";

import { Plus, X, CheckCircle, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  DOCUMENT_TYPES,
  ACCEPTED_DOCUMENT_FORMATS,
  DOCUMENT_TYPE_CONFIG,
  type DocumentType,
} from "@/lib/constants/documents";
import { useAuth } from "@/lib/hooks/use-auth";
import { useChatGPTGuidance } from "@/lib/hooks/use-chatgpt-guidance";
import { DocumentService } from "@/lib/services/document";
import type { Document } from "@/lib/types/document";
import { DocumentGuidanceCard } from "@/components/dashboard/products/DocumentGuidanceCard";

type HandleUploadResult = {
  success: boolean;
  documents: Document[];
  errors: string[];
};

interface DocumentUploadStepProps {
  form: UseFormReturn<any>;
}

export function DocumentUploadStep({ form }: DocumentUploadStepProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState(false);
  const t = useTranslations();

  const companyId =
    user?.user_metadata?.company_id || "7d26ed35-49ca-4c0d-932e-52254fb0e5b8";

  // Get product type and subcategory from form
  const productType = form.watch("product_type");
  const subcategory = form.watch("product_subcategory");

  // Get real labels from localStorage (set in BasicInfoStep)
  const getCategoryLabel = (categoryId: string): string => {
    return localStorage.getItem('selectedCategoryLabel') || categoryId;
  };

  const getSubcategoryLabel = (subcategoryId: string): string => {
    return localStorage.getItem('selectedSubcategoryLabel') || subcategoryId;
  };

  // ChatGPT guidance hook - Send real labels to AI
  const { guidance, isLoading: guidanceLoading, error: guidanceError, refreshGuidance } = useChatGPTGuidance({
    productType: getCategoryLabel(productType),
    subcategory: getSubcategoryLabel(subcategory),
    enabled: !!productType && !!subcategory,
  });

  // Form trigger metodunu sadece bu komponentin yaşam döngüsü boyunca override edelim
  useEffect(() => {
    const originalTrigger = form.trigger;

    // Override the trigger method
    form.trigger = async (name?: string | string[]) => {
      if (!isVerified) {
        toast({
          title: t("admin.product.steps.documentUpload.verificationRequired"),
          description: t(
            "admin.product.steps.documentUpload.pleaseVerifyDocuments"
          ),
          variant: "destructive",
        });
        return false;
      }
      return originalTrigger(name);
    };

    // Cleanup function to restore the original trigger method
    return () => {
      form.trigger = originalTrigger;
    };
  }, [form, isVerified, toast]);

  // ✅ Dosya yükleme işlemi
  const handleDocumentUpload = useCallback(
    async (
      files: FileList,
      docType: string,
      existingDocs: Document[] = []
    ): Promise<HandleUploadResult> => {
      if (!companyId || !files.length) {
        return {
          success: false,
          documents: existingDocs,
          errors: [t("admin.products.steps.documentUpload.invalidUploadParameters")],
        };
      }

      const newDocs = [...existingDocs];
      const errors: string[] = [];

      const validFiles = Array.from(files).filter((file) => {
        const isValidType = ACCEPTED_DOCUMENT_FORMATS.some((format) =>
          file.name.toLowerCase().endsWith(format)
        );

        const isValidSize =
          file.size <=
          (DOCUMENT_TYPE_CONFIG[docType]?.maxSize || 10 * 1024 * 1024);

        if (!isValidType) {
          errors.push(
            `${file.name}: ${t("admin.products.steps.documentUpload.invalidFileType")}`
          );
        }
        if (!isValidSize) {
          errors.push(
            `${file.name}: ${t("admin.products.steps.documentUpload.fileSizeExceedsLimit")}`
          );
        }

        return isValidType && isValidSize;
      });

      if (validFiles.length === 0) {
        return { success: false, documents: existingDocs, errors };
      }

      await Promise.all(
        validFiles.map(async (file) => {
          try {
            const url = await DocumentService.uploadDocument(file, {
              companyId,
              bucketName:
                process.env.NEXT_PUBLIC_PRODUCT_DOCUMENTS_BUCKET ||
                "product-documents",
            });

            newDocs.push({
              name: file.name,
              url: url || "",
              type: docType as DocumentType,
              id: "",
              manufacturer: "",
              manufacturerId: "",
              status: "pending",
            } as Document);
          } catch (error) {
            errors.push(
              `Error uploading ${file.name}: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          }
        })
      );

      return {
        success: errors.length === 0,
        documents: newDocs,
        errors,
      };
    },
    [companyId]
  );

  // ✅ Dosya yükleme fonksiyonu
  const handleFileChange = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      field: any,
      docType: string
    ) => {
      const files = e.target.files;
      if (!files?.length) return;

      const result = await handleDocumentUpload(
        files,
        docType,
        field.value || []
      );

      if (result.errors.length > 0) {
        toast({
          title: t("admin.products.steps.documentUpload.uploadIssues"),
          description: result.errors.join("\n"),
          variant: "destructive",
        });
      }

      field.onChange([...result.documents]);
      form.setValue(`documents.${docType}`, result.documents || []);
    },
    [handleDocumentUpload, toast, form]
  );

  return (
    <div className="space-y-6">
      {/* ChatGPT Guidance Card */}
      {(productType && subcategory) && (
        <DocumentGuidanceCard
          guidance={guidance}
          isLoading={guidanceLoading}
          error={guidanceError}
          onRefresh={refreshGuidance}
          productTypeLabel={getCategoryLabel(productType)}
          subcategoryLabel={getSubcategoryLabel(subcategory)}
        />
      )}

      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold">
            Ürün Belgeleri
          </h3>
          <p className="text-sm text-muted-foreground">
            AI rehberliğine göre gerekli belgeleri yükleyin
          </p>
        </div>

      {/* ✅ ChatGPT rehberliğine göre belge türleri için alan oluştur */}
      {guidance ? (
        <>
          {/* Zorunlu Belgeler */}
          {guidance.requiredDocuments.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Zorunlu Belgeler
              </h4>
              <div className="space-y-4">
                {guidance.requiredDocuments.map((docReq) => {
                  const docType = {
                    id: docReq.type,
                    label: docReq.label,
                    description: docReq.description
                  };

                  return (
                    <FormField
                      key={docReq.type}
                      control={form.control}
                      name={`documents.${docReq.type}`}
                      render={({ field }) => (
                        <FormItem className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <FormLabel className="flex items-center gap-2 text-green-800">
                            {docType.label}
                            <span className="text-red-500 text-xs">*</span>
                            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                              Zorunlu
                            </span>
                          </FormLabel>
                          <div className="text-sm text-gray-600 mb-3">
                            {docReq.description}
                          </div>
                          <FormControl>
                            <div className="space-y-2">
                              {/* Yüklenen dosyaları göster */}
                              {field.value?.map((file: any, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    value={file.name}
                                    readOnly
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newFiles = field.value.filter(
                                        (_: any, i: number) => i !== index
                                      );
                                      field.onChange(newFiles);
                                      form.setValue(`documents.${docReq.type}`, newFiles);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}

                              {/* Dosya yükleme alanı */}
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  id={`file-upload-${docReq.type}`}
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, field, docReq.type)}
                                  accept={ACCEPTED_DOCUMENT_FORMATS.map(
                                    (format) => `.${format}`
                                  ).join(",")}
                                  multiple
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const input = document.getElementById(
                                      `file-upload-${docReq.type}`
                                    ) as HTMLInputElement;
                                    input?.click();
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Belge Yükle
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Opsiyonel Belgeler */}
          {guidance.optionalDocuments.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Opsiyonel Belgeler
              </h4>
              <div className="space-y-4">
                {guidance.optionalDocuments.map((docReq) => {
                  const docType = {
                    id: docReq.type,
                    label: docReq.label,
                    description: docReq.description
                  };

                  return (
                    <FormField
                      key={docReq.type}
                      control={form.control}
                      name={`documents.${docReq.type}`}
                      render={({ field }) => (
                        <FormItem className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <FormLabel className="flex items-center gap-2 text-blue-800">
                            {docType.label}
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                              Opsiyonel
                            </span>
                          </FormLabel>
                          <div className="text-sm text-gray-600 mb-3">
                            {docReq.description}
                          </div>
                          <FormControl>
                            <div className="space-y-2">
                              {/* Yüklenen dosyaları göster */}
                              {field.value?.map((file: any, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    value={file.name}
                                    readOnly
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newFiles = field.value.filter(
                                        (_: any, i: number) => i !== index
                                      );
                                      field.onChange(newFiles);
                                      form.setValue(`documents.${docReq.type}`, newFiles);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}

                              {/* Dosya yükleme alanı */}
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  id={`file-upload-${docReq.type}`}
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, field, docReq.type)}
                                  accept={ACCEPTED_DOCUMENT_FORMATS.map(
                                    (format) => `.${format}`
                                  ).join(",")}
                                  multiple
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const input = document.getElementById(
                                      `file-upload-${docReq.type}`
                                    ) as HTMLInputElement;
                                    input?.click();
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Belge Yükle
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        // ChatGPT rehberliği yoksa, varsayılan belge türlerini göster
        DOCUMENT_TYPES.map((docType) => (
          <FormField
            key={docType.id}
            control={form.control}
            name={`documents.${docType.id}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{docType.label}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {/* ✅ Yüklenen dosyaları göster */}
                    {field.value?.map((file: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={file.name}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newFiles = field.value.filter(
                              (_: any, i: number) => i !== index
                            );
                            field.onChange(newFiles);
                            form.setValue(`documents.${docType.id}`, newFiles);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* ✅ Dosya yükleme alanı */}
                    <div className="flex items-center gap-2">
                      {/* Gizli input */}
                      <Input
                        type="file"
                        id={`file-upload-${docType.id}`}
                        className="hidden"
                        onChange={(e) => handleFileChange(e, field, docType.id)}
                        accept={ACCEPTED_DOCUMENT_FORMATS.map(
                          (format) => `.${format}`
                        ).join(",")}
                        multiple
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById(
                            `file-upload-${docType.id}`
                          ) as HTMLInputElement;
                          input?.click();
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("admin.product.steps.documentUpload.addDocument")}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))
      )}

      {/* Belgeleri Doğrula */}
      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 mt-6 bg-yellow-50 border-yellow-200">
        <Checkbox
          id="documents-verification"
          checked={isVerified}
          onCheckedChange={(checked) => setIsVerified(checked === true)}
        />
        <div className="space-y-1 leading-none">
          <label
            htmlFor="documents-verification"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Belgeleri Doğrula
          </label>
          <p className="text-sm text-muted-foreground">
            Tüm yüklenen belgelerin doğruluğunu doğrulayın
          </p>
        </div>
      </div>
        </Card>
      </div>
    );
  }
