"use client";

import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ManufacturerSearch } from "./manufacturerSearch/ManufacturerSearch";

interface ManufacturerSelectProps {
  form: any;
}

export function ManufacturerSelect({
  form,
}: ManufacturerSelectProps) {
  const t = useTranslations("productManagement.addProduct");

  const handleManufacturerChange = (value: string) => {
    form.setValue("manufacturer_id", value);
    form.setValue("company_id", value);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">{t("form.steps.manufacturer")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("form.fields.manufacturer.description")}
            </p>
          </div>

          <FormField
            control={form.control}
            name="manufacturer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer</FormLabel>
                <FormControl>
                  <ManufacturerSearch
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      handleManufacturerChange(value || "");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
