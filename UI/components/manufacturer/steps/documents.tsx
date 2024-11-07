"use client";

import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";

interface DocumentsStepProps {
  form: UseFormReturn<any>;
}

export function DocumentsStep({ form }: DocumentsStepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="documents"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>Upload Documents</FormLabel>
            <Input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                onChange(files);
              }}
              {...field}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}