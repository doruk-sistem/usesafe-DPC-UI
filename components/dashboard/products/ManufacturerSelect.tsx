import { useTranslations } from "next-intl";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ManufacturerSelectProps {
  form: any;
  manufacturers: Array<{
    id: string;
    name: string;
  }>;
}

export function ManufacturerSelect({ form, manufacturers }: ManufacturerSelectProps) {
  const t = useTranslations("productManagement.addProduct");

  return (
    <FormField
      control={form.control}
      name="manufacturer_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("form.manufacturer.label")}</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.manufacturer.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {manufacturers.map((manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>
            {t("form.manufacturer.description")}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 