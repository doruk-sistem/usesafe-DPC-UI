"use client";

import { Plus, X, CheckCircle, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

import { DocumentGuidanceCard } from "@/components/dashboard/products/DocumentGuidanceCard";
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
  ACCEPTED_DOCUMENT_FORMATS,
  DOCUMENT_TYPE_CONFIG,
} from "@/lib/constants/documents";
import { useChatGPTGuidance } from "@/lib/hooks/use-chatgpt-guidance";
import type { Document } from "@/lib/types/document";

type HandleUploadResult = {
  success: boolean;
  documents: Document[];
  errors: string[];
};

interface DocumentUploadStepProps {
  form: UseFormReturn<any>;
}

export function DocumentUploadStep({ form }: DocumentUploadStepProps) {
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState(false);
  const t = useTranslations();

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

  console.log(guidance);

  // Form trigger metodunu sadece bu komponentin yaşam döngüsü boyunca override edelim
  useEffect(() => {
    const originalTrigger = form.trigger;

    // Override the trigger method
    form.trigger = async (name?: string | string[]) => {
      // Zorunlu belgelerin yüklenip yüklenmediğini kontrol et
      const documents = form.getValues('documents');
      
      // AI rehberliği varsa zorunlu belgeleri kontrol et
      if (guidance && guidance.requiredDocuments && guidance.requiredDocuments.length > 0) {
        const requiredDocs = guidance.requiredDocuments;
        const missingRequiredDocs = requiredDocs.filter((doc: any) => {
          const docType = doc.type;
          const uploadedDocs = documents?.[docType];
          return !uploadedDocs || uploadedDocs.length === 0;
        });
        
        if (missingRequiredDocs.length > 0) {
          toast({
            title: "Required Documents Missing",
            description: `Please upload the following required documents: ${missingRequiredDocs.map((doc: any) => doc.label).join(', ')}`,
            variant: "destructive",
          });
          return false;
        }
      }
      
      // Belgeleri doğrula checkbox'ı kontrol et
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

  // ✅ Dosya yükleme işlemi - Artık sadece form state'inde tutuyoruz
  const handleDocumentUpload = useCallback(
    async (
      files: FileList,
      docType: string,
      existingDocs: Document[] = []
    ): Promise<HandleUploadResult> => {
      if (!files.length) {
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

      // Artık bucket'a kaydetmiyoruz, sadece form state'inde tutuyoruz
      validFiles.forEach((file) => {
        newDocs.push({
          name: file.name,
          url: "", // Boş bırakıyoruz, submit sırasında doldurulacak
          type: docType, // AI'dan gelen orijinal belge türü
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          manufacturer: "",
          manufacturerId: "",
          status: "pending",
          uploadedAt: new Date().toISOString(),
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          version: "1.0",
          file: file // File objesini saklıyoruz
        } as Document);
      });

      return {
        success: errors.length === 0,
        documents: newDocs,
        errors,
      };
    },
    []
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

      {/* DPP Requirement Card - Only show if DPP is required */}
      {guidance && guidance.dppRequired && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Info className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-orange-800 mb-2">
                Digital Product Passport (DPP) Required
              </h4>
              <p className="text-sm text-orange-700 mb-3">
                {guidance.dppNotes}
              </p>
              <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                ESPR Compliance Required
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* DPP Not Required Info - Only show if explicitly false and guidance is loaded */}
      {guidance && guidance.dppRequired === false && (
        <Card className="p-4 border-gray-200 bg-gray-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-2">
                Digital Product Passport (DPP) Not Required
              </h4>
              <p className="text-sm text-gray-700">
                {guidance.dppNotes}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold">
            Product Documents
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload the required documents according to AI guidance
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
                Required Documents
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
                              Required
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
                                  Upload Document
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
                Optional Documents
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
                              Optional
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
                                  Upload Document
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
        // ChatGPT rehberliği yüklenene kadar loading göster
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">AI document guidance is loading...</p>
          </div>
        </div>
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
            Verify Documents
          </label>
          <p className="text-sm text-muted-foreground">
            Verify the accuracy of all uploaded documents
          </p>
        </div>
      </div>
        </Card>
      </div>
    );
  }
