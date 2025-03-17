"use client";

import clsx from "clsx";
import { Plus, Upload, X } from "lucide-react";
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
import { PRODUCT_TYPE_OPTIONS, type SubcategoryOption } from "@/lib/constants/product-types";
import type { KeyFeature, NewProduct } from "@/lib/types/product";
import type { Json } from "@/lib/types/supabase";

interface BasicInfoStepProps {
  form: UseFormReturn<NewProduct>;
}

type OptionType = {
  value: string;
  label: string;
};

// ✅ Ortak stil tanımı
const selectClassNames = {
  control: ({ isFocused }: { isFocused: boolean }) =>
    clsx(
      "border rounded-md shadow-sm px-2 py-1",
      isFocused ? "border-primary ring-2 ring-primary" : "border-input"
    ),
  menu: () => "border border-input rounded-md shadow-lg",
  option: ({ isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }) =>
    clsx(
      "px-3 py-2 cursor-pointer",
      (isFocused || isSelected) && "bg-primary text-white"
    ),
};

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);

  const productType = form.watch("product_type");

  useEffect(() => {
    // ✅ Seçilen ürün tipine göre alt kategorileri güncelle
    const selectedProductType = PRODUCT_TYPE_OPTIONS.find(
      (option) => option.value === productType
    );

    if (selectedProductType) {
      setSubcategories(selectedProductType.subcategories);

      const currentSubcategory = form.getValues("product_subcategory");
      const subcategoryExists = selectedProductType.subcategories.some(
        (sub) => sub.value === currentSubcategory
      );

      if (!subcategoryExists && currentSubcategory) {
        form.setValue("product_subcategory", "");
      }
    } else {
      setSubcategories([]);
    }
  }, [productType, form]);

  return (
    <div className="space-y-8">
      {/* ✅ Temel Bilgiler */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
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
              <FormLabel>Product Type</FormLabel>
              <FormControl>
                <Select
                  options={PRODUCT_TYPE_OPTIONS}
                  value={PRODUCT_TYPE_OPTIONS.find((option) => option.value === field.value)}
                  onChange={(selectedOption: OptionType | null) => {
                    const newValue = selectedOption?.value || "";
                    field.onChange(newValue);
                    form.setValue("product_subcategory", "");
                  }}
                  placeholder="Select Product Type"
                  classNames={selectClassNames}
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
              <FormLabel>Product Subcategory</FormLabel>
              <FormControl>
                <Select
                  options={subcategories}
                  value={subcategories.find((option) => option.value === field.value)}
                  onChange={(selectedOption: OptionType | null) => {
                    field.onChange(selectedOption?.value || "");
                  }}
                  placeholder="Select Subcategory"
                  className="w-full"
                  classNames={selectClassNames}
                  isDisabled={subcategories.length === 0}
                />
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
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="Enter product model" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ✅ Key Features (Tekrarlama kaldırıldı) */}
      <Card className="p-4">
        <FormField
          control={form.control}
          name="key_features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Features</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {field.value.map((feature: KeyFeature, index: number) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                      <Input
                        placeholder="Feature name"
                        value={feature.name}
                        onChange={(e) => {
                          const newFeatures = [...field.value];
                          newFeatures[index].name = e.target.value;
                          field.onChange(newFeatures);
                        }}
                      />
                      <Input
                        placeholder="Value"
                        value={feature.value}
                        onChange={(e) => {
                          const newFeatures = [...field.value];
                          newFeatures[index].value = e.target.value;
                          field.onChange(newFeatures);
                        }}
                      />
                      <Input
                        placeholder="Unit (optional)"
                        value={feature.unit || ""}
                        onChange={(e) => {
                          const newFeatures = [...field.value];
                          newFeatures[index].unit = e.target.value || undefined;
                          field.onChange(newFeatures);
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newFeatures = [...field.value];
                          newFeatures.splice(index, 1);
                          field.onChange(newFeatures);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      field.onChange([...field.value, { name: "", value: "", unit: undefined }]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Card>
    </div>
  );
}