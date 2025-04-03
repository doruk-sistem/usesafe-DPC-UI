"use client";

import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

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
  REQUIRED_DOCUMENTS,
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
  setValidationFunction: (fn: () => boolean) => void;
  onNext: () => void;
}

export function DocumentUploadStep({
  form,
  setValidationFunction,
  onNext,
}: DocumentUploadStepProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations("productManagement.addProduct");
  const companyId = user?.user_metadata?.company_id;

  if (!companyId) {
    toast({
      title: "Error",
      description: "Company ID not found",
      variant: "destructive",
    });
    return null;
  }

  const productType = form.watch("product_type") || "";

  const normalizedType = productType
    .toLowerCase()
    .replace(/[ğ]/g, "g")
    .replace(/[ü]/g, "u")
    .replace(/[ş]/g, "s")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ç]/g, "c")
    .replace(/\s+|-/g, "_");

  const requiredConfig = REQUIRED_DOCUMENTS[normalizedType] ||
    REQUIRED_DOCUMENTS[productType.toUpperCase()] ||
    REQUIRED_DOCUMENTS[productType] ||
    {};

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

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
          errors: ["Invalid upload parameters"],
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
            `${
              file.name
            }: Invalid file type. Accepted formats: ${ACCEPTED_DOCUMENT_FORMATS.join(
              ", "
            )}`
          );
        }
        if (!isValidSize) {
          const maxSizeMB =
            (DOCUMENT_TYPE_CONFIG[docType]?.maxSize || 10 * 1024 * 1024) /
            (1024 * 1024);
          errors.push(`${file.name}: File size exceeds limit (${maxSizeMB}MB)`);
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

            if (url) {
              newDocs.push({
                name: file.name,
                url: url,
                type: docType,
              });
            } else {
              errors.push(`Failed to upload ${file.name}: No URL returned`);
            }
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
          title: "Upload Issues",
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
        <h3 className="text-lg font-semibold">{t("form.documents.title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("form.documents.description")}
        </p>
      </div>

      {DOCUMENT_TYPES.filter((docType) => {
        if (Object.keys(requiredConfig).length === 0) return true;
        return requiredConfig[docType.id] === true;
      }).map((docType) => (
        <FormField
          key={docType.id}
          control={form.control}
          name={`documents.${docType.id}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t(`form.documents.types.${docType.id}`)}
                {requiredConfig[docType.id] && " *"}
              </FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {field.value?.map((doc: Document, index: number) => (
                    <div key={index} className="flex items-center gap-4">
                      <Input value={doc.name} disabled />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newDocs = [...(field.value || [])];
                          newDocs.splice(index, 1);
                          field.onChange(newDocs);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div>
                    <Input
                      type="file"
                      accept={ACCEPTED_DOCUMENT_FORMATS.join(",")}
                      onChange={(e) => handleFileChange(e, field, docType.id)}
                      multiple
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </Card>
  );
}
