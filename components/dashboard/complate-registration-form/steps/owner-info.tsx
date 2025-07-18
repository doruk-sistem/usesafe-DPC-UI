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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface OwnerInfoStepProps {
  form: UseFormReturn<any>;
}

const countryCodes = [
  { value: "+90", label: "Turkey", flag: "🇹🇷" },
  { value: "+1", label: "USA", flag: "🇺🇸" },
  { value: "+44", label: "UK", flag: "🇬🇧" },
  { value: "+49", label: "Germany", flag: "🇩🇪" },
  { value: "+33", label: "France", flag: "🇫🇷" },
  { value: "+39", label: "Italy", flag: "🇮🇹" },
  { value: "+34", label: "Spain", flag: "🇪🇸" },
  { value: "+31", label: "Netherlands", flag: "🇳🇱" },
  { value: "+46", label: "Sweden", flag: "🇸🇪" },
  { value: "+47", label: "Norway", flag: "🇳🇴" },
  { value: "+358", label: "Finland", flag: "🇫🇮" },
  { value: "+45", label: "Denmark", flag: "🇩🇰" },
];

export function OwnerInfoStep({ form }: OwnerInfoStepProps) {
  const t = useTranslations("registration.steps.companyInfo");
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="nationalId"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("nationalId")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                maxLength={11}
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

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="countryCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("countryCode")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("countryCodePlaceholder")}>
                      {field.value &&
                        countryCodes.find((c) => c.value === field.value) && (
                          <span className="flex items-center gap-2">
                            <span>
                              {
                                countryCodes.find(
                                  (c) => c.value === field.value
                                )?.flag
                              }
                            </span>
                            <span>{field.value}</span>
                          </span>
                        )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countryCodes.map((code) => (
                    <SelectItem key={code.value} value={code.value}>
                      <span className="flex items-center gap-2">
                        <span>{code.flag}</span>
                        <span>{code.label}</span>
                        <span className="text-muted-foreground">
                          {code.value}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <FormItem className="col-span-2">
              <FormLabel>{t("phone")}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  {...field}
                  maxLength={10}
                  placeholder={t("phonePlaceholder")}
                  className={cn(
                    fieldState.error &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </FormControl>
              <FormDescription>
                {t("phoneDescription")}
              </FormDescription>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
