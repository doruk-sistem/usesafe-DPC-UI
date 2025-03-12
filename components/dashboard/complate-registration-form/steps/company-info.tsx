"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CompanyInfoStepProps {
  form: UseFormReturn<any>;
}

export function CompanyInfoStep({ form }: CompanyInfoStepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="companyName"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Company Name *</FormLabel>
            <FormControl>
              <Input
                {...field}
                className={cn(
                  fieldState.error &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
              />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="taxId"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Tax ID *</FormLabel>
            <FormControl>
              <Input
                {...field}
                maxLength={10}
                pattern="\d*"
                inputMode="numeric"
                placeholder="Enter 10-digit Tax ID"
                className={cn(
                  fieldState.error &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
              />
            </FormControl>
            <FormDescription>Must be exactly 10 digits</FormDescription>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tradeRegisterNumber"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Trade Register Number</FormLabel>
            <FormControl>
              <Input
                {...field}
                className={cn(
                  fieldState.error &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
              />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="mersisNumber"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>MERSIS Number</FormLabel>
            <FormControl>
              <Input
                {...field}
                className={cn(
                  fieldState.error &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
              />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />
    </div>
  );
}
