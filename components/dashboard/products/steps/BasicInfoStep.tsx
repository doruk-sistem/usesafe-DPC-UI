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

// Ortak stil tanımı
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
    // Find the selected product type and get its subcategories
    const selectedProductType = PRODUCT_TYPE_OPTIONS.find(
      (option) => option.value === productType
    );
    
    if (selectedProductType) {
      setSubcategories(selectedProductType.subcategories);
      
      // Clear subcategory selection if the product type changes and there's no matching subcategory
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

  const convertToKeyFeature = (json: Json): KeyFeature => {
    if (typeof json === "object" && json !== null && !Array.isArray(json)) {
      const obj = json as Record<string, Json>;
      return {
        name: typeof obj.name === "string" ? obj.name : "",
        value: typeof obj.value === "string" ? obj.value : "",
        unit: typeof obj.unit === "string" ? obj.unit : undefined,
      };
    }
    return { name: "", value: "", unit: undefined };
  };

  return (
    <div className="space-y-8">
      <Card className="p-4">
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Images</FormLabel>
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
                      Upload Image
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
                  value={PRODUCT_TYPE_OPTIONS.find(option => option.value === field.value)}
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
            <FormItem className={subcategories.length > 0 ? "md:col-span-1" : "col-span-2"}>
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

        <Card className="p-4 col-span-2">
          <FormField
            control={form.control}
            name="key_features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Features</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {(Array.isArray(field.value) ? field.value : []).map(
                      (feature: KeyFeature, index: number) => (
                        <div key={index} className="flex gap-4">
                          <Input
                            placeholder="Feature name"
                            value={feature.name}
                            onChange={(e) => {
                              const newFeatures = [...field.value];
                              newFeatures[index] = {
                                ...feature,
                                name: e.target.value,
                              };
                              field.onChange(newFeatures);
                            }}
                          />
                          <Input
                            placeholder="Value"
                            value={feature.value}
                            onChange={(e) => {
                              const newFeatures = [...field.value];
                              newFeatures[index] = {
                                ...feature,
                                value: e.target.value,
                              };
                              field.onChange(newFeatures);
                            }}
                          />
                          <Input
                            placeholder="Unit (optional)"
                            value={feature.unit || ""}
                            onChange={(e) => {
                              const newFeatures = [...field.value];
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
                              const newFeatures = [...field.value];
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
                          ...(Array.isArray(field.value) ? field.value : []),
                          newFeature,
                        ]);
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
    </div>
  );
}
