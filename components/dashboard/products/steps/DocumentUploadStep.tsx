"use client";

import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react"; // useState ekledik
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
  const companyId =
    user?.user_metadata?.company_id || "7d26ed35-49ca-4c0d-932e-52254fb0e5b8";

  const productType = form.watch("product_type");
  console.log("Selected Product Type:", productType);

  const normalizedType = productType
    ?.toLowerCase()
    .replace(/[ğ]/g, "g")
    .replace(/[ü]/g, "u")
    .replace(/[ş]/g, "s")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ç]/g, "c")
    .replace(/\s+|-/g, "_");
  console.log("Normalized Type:", normalizedType);

  const requiredConfig = productType
    ? REQUIRED_DOCUMENTS[normalizedType] ||
      REQUIRED_DOCUMENTS[productType.toUpperCase()] ||
      REQUIRED_DOCUMENTS[productType] ||
      {}
    : {};

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

            newDocs.push({
              name: file.name,
              url: url,
              type: docType,
            });
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
        <h3 className="text-lg font-semibold">Product Documents</h3>
        <p className="text-sm text-muted-foreground">
          Upload relevant documents for your product. Required documents are
          marked with (*).
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
              <FormLabel className="flex items-center gap-2">
                {docType.label}
                {requiredConfig[docType.id] === true && (
                  <span className="text-sm text-red-500">*</span>
                )}
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
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

                  <div className="flex items-center gap-2">
                    <input
                      id={`file-upload-${docType.id}`}
                      type="file"
                      accept={ACCEPTED_DOCUMENT_FORMATS.map(
                        (format) => `.${format}`
                      ).join(",")}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, field, docType.id)}
                      multiple
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        document
                          .getElementById(`file-upload-${docType.id}`)
                          ?.click();
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </div>
                </div>
              </FormControl>
              {requiredConfig[docType.id] && (
                <p className="text-sm text-muted-foreground mt-1">
                  This document is required for this product category
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      <FormField
        control={form.control}
        name="documents_confirmed"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                I confirm that all uploaded documents are accurate and authentic
              </FormLabel>
              <p className="text-sm text-muted-foreground">
                By checking this box, you acknowledge that all documents
                provided are genuine and contain accurate information.
              </p>
            </div>
          </FormItem>
        )}
      />
    </Card>
  );
}
