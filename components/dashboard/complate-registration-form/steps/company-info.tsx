"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("registration.steps.companyInfo");
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="companyName"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("companyName")}</FormLabel>
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
            <FormLabel>{t("taxId")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                maxLength={10}
                pattern="\d*"
                inputMode="numeric"
                placeholder={t("taxIdPlaceholder")}
                className={cn(
                  fieldState.error &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
              />
            </FormControl>
            <FormDescription>{t("taxIdDescription")}</FormDescription>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tradeRegisterNumber"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("tradeRegisterNumber")}</FormLabel>
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
            <FormLabel>{t("mersisNumber")}</FormLabel>
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
