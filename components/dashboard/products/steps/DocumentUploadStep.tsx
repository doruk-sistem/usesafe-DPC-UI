"use client";

import { Plus, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useCallback } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { DocumentService } from "@/lib/services/document";
import { useToast } from "@/components/ui/use-toast";
import { DOCUMENT_TYPES, ACCEPTED_DOCUMENT_FORMATS, DOCUMENT_TYPE_CONFIG } from "@/lib/constants/documents";
import type { Document } from "@/lib/types/document";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
  const companyId = user?.user_metadata?.company_id || "7d26ed35-49ca-4c0d-932e-52254fb0e5b8";

  const handleDocumentUpload = useCallback(async (
    files: FileList,
    docType: string,
    existingDocs: Document[] = []
  ): Promise<HandleUploadResult> => {
    if (!companyId || !files.length) {
      return { success: false, documents: existingDocs, errors: ['Invalid upload parameters'] };
    }

    const newDocs = [...existingDocs];
    const errors: string[] = [];

    // Validate file types and sizes before upload
    const invalidFiles = Array.from(files).filter(file => {
      const isValidType = ACCEPTED_DOCUMENT_FORMATS
        .split(',')
        .some(format => file.name.toLowerCase().endsWith(format.replace('.', '')));
      
      const isValidSize = file.size <= (DOCUMENT_TYPE_CONFIG[docType]?.maxSize || 10 * 1024 * 1024);
      
      if (!isValidType) {
        errors.push(`${file.name}: Invalid file type`);
      }
      if (!isValidSize) {
        errors.push(`${file.name}: File size exceeds limit`);
      }
      
      return !isValidType || !isValidSize;
    });

    if (invalidFiles.length > 0) {
      return { success: false, documents: existingDocs, errors };
    }
    await Promise.all(Array.from(files).map(async (file) => {
      try {
        const url = await DocumentService.uploadDocument(file, {
          companyId,
          bucketName: process.env.NEXT_PUBLIC_PRODUCT_DOCUMENTS_BUCKET || 'product-documents'
        });

        newDocs.push({
          name: file.name,
          url: url,
          type: docType
        });
      } catch (error) {
        errors.push(`Error uploading ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }));

    return {
      success: errors.length === 0,
      documents: newDocs,
      errors
    };
  }, [companyId]);

  const handleFileChange = useCallback(async (
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

    field.onChange(result.documents);

    if (result.errors.length > 0) {
      toast({
        title: "Upload Issues",
        description: result.errors.join('\n'),
        variant: "destructive"
      });
    }
  }, [handleDocumentUpload, toast]);

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Product Documents</h3>
        <p className="text-sm text-muted-foreground">
          Upload relevant documents for your product. All documents are optional.
        </p>
      </div>

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
                          const newFiles = [...field.value];
                          newFiles.splice(index, 1);
                          field.onChange(newFiles);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept={ACCEPTED_DOCUMENT_FORMATS}
                      onChange={(e) => handleFileChange(e, field, docType.id)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => document.querySelector<HTMLInputElement>(`input[name="documents.${docType.id}"]`)?.click()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
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