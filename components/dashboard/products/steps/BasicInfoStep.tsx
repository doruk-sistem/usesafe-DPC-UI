"use client";

import clsx from "clsx";
import { Plus, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import Select from "react-select";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { KeyFeature, NewProduct } from "@/lib/types/product";
import type { Json } from "@/lib/types/supabase";
import { productCategoriesService, type ProductCategory } from "@/lib/services/product-categories";
import { supabase } from "@/lib/supabase/client";

interface BasicInfoStepProps {
  form: UseFormReturn<NewProduct>;
}

type OptionType = {
  value: string;
  label: string;
};

// Ortak stil tanımı
const selectClassNames = {
  control: ({ isFocused }: { isFocused: boolean }) =>
    clsx(
      "border rounded-md shadow-sm px-2 py-1",
      isFocused ? "border-primary ring-2 ring-primary" : "border-input"
    ),
  menu: () => "border border-input rounded-md shadow-lg",
  option: ({
    isFocused,
    isSelected,
  }: {
    isFocused: boolean;
    isSelected: boolean;
  }) =>
    clsx(
      "px-3 py-2 cursor-pointer",
      (isFocused || isSelected) && "bg-primary text-white"
    ),
};

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const t = useTranslations("productManagement.form");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const productType = form.watch("product_type");

  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*");
      setCategories(data || []);
    };
    test();
  }, []);

  const categoryOptions = categories.map(category => ({
    value: category.id.toString(),
    label: category.name
  }));

  return (
    <div className="space-y-8">
      <Card className="p-4">
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("images.title")}</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {field.value.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newImages = [...field.value];
                          newImages.splice(index, 1);
                          field.onChange(newImages);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {image.is_primary && (
                        <Badge
                          variant="secondary"
                          className="absolute bottom-2 left-2"
                        >
                          Primary
                        </Badge>
                      )}
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center gap-2 cursor-pointer aspect-square rounded-lg border-2 border-dashed hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t("images.upload")}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const newImage = {
                            url: URL.createObjectURL(file),
                            alt: file.name,
                            is_primary: field.value.length === 0,
                            fileObject: file,
                          };
                          field.onChange([...field.value, newImage]);
                        }
                      }}
                    />
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("name.placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("model.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("model.placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("type.label")}</FormLabel>
              <FormControl>
                <Select
                  options={categoryOptions}
                  value={categoryOptions.find(
                    (option) => option.value === field.value
                  )}
                  onChange={(selectedOption: OptionType | null) => {
                    const newValue = selectedOption?.value || "";
                    field.onChange(newValue);
                  }}
                  placeholder={t("type.placeholder")}
                  classNames={selectClassNames}
                  isLoading={false}
                  isDisabled={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product_subcategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("subcategory.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("subcategory.placeholder")}
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>{t("description.label")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("description.placeholder")}
                  className="min-h-[100px]"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
       <Card className="p-4 col-span-2">
          <FormField
            control={form.control}
            name="key_features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("keyFeatures.title")}</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {((field.value || []) as KeyFeature[]).map(
                      (feature: KeyFeature, index: number) => (
                        <div key={index} className="flex gap-4">
                          <Input
                            placeholder={t("keyFeatures.name")}
                            value={feature.name}
                            onChange={(e) => {
                              const newFeatures = [...(field.value || []) as KeyFeature[]];
                              newFeatures[index] = {
                                ...feature,
                                name: e.target.value,
                              };
                              field.onChange(newFeatures);
                            }}
                          />
                          <Input
                            placeholder={t("keyFeatures.value")}
                            value={feature.value}
                            onChange={(e) => {
                              const newFeatures = [...(field.value || []) as KeyFeature[]];
                              newFeatures[index] = {
                                ...feature,
                                value: e.target.value,
                              };
                              field.onChange(newFeatures);
                            }}
                          />
                          <Input
                            placeholder={t("keyFeatures.unit")}
                            value={feature.unit || ""}
                            onChange={(e) => {
                              const newFeatures = [...(field.value || []) as KeyFeature[]];
                              newFeatures[index] = {
                                ...feature,
                                unit: e.target.value || undefined,
                              };
                              field.onChange(newFeatures);
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const newFeatures = [...(field.value || []) as KeyFeature[]];
                              newFeatures.splice(index, 1);
                              field.onChange(newFeatures);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newFeature: KeyFeature = {
                          name: "",
                          value: "",
                          unit: undefined,
                        };
                        field.onChange([
                          ...((field.value || []) as KeyFeature[]),
                          newFeature,
                        ]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("keyFeatures.add")}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>
      </div>
    </div>
  );
}
