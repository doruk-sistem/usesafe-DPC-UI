"use client";

import { Plus, X } from "lucide-react";
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
import { DocumentService } from "@/lib/services/document";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState(false);
  const t = useTranslations();

  const companyId =
    user?.user_metadata?.company_id || "7d26ed35-49ca-4c0d-932e-52254fb0e5b8";

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
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {t("admin.product.steps.documentUpload.productDocuments")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("admin.product.steps.documentUpload.uploadDocuments")}
        </p>
      </div>

      {/* ✅ Tüm belge türleri için alan oluştur */}
      {DOCUMENT_TYPES.map((docType) => (
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
      ))}

      {/* Doküman doğrulama checkbox'ı */}
      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 mt-6">
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
            {t("admin.product.steps.documentUpload.verifyDocuments")}
          </label>
          <p className="text-sm text-muted-foreground">
            {t(
              "admin.product.steps.documentUpload.verifyDocumentsDescription"
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}
