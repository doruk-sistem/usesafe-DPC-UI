"use client";

import { Plus, Upload, X } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { NewProduct, KeyFeature } from "@/lib/types/product";
import type { Json } from "@/lib/types/supabase";

interface BasicInfoStepProps {
  form: UseFormReturn<NewProduct>;
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const convertToKeyFeature = (json: Json): KeyFeature => {
    if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
      const obj = json as Record<string, Json>;
      return {
        name: typeof obj.name === 'string' ? obj.name : "",
        value: typeof obj.value === 'string' ? obj.value : "",
        unit: typeof obj.unit === 'string' ? obj.unit : undefined
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
                        <Badge variant="secondary" className="absolute bottom-2 left-2">
                          Primary
                        </Badge>
                      )}
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center gap-2 cursor-pointer aspect-square rounded-lg border-2 border-dashed hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload Image</span>
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
                            is_primary: field.value.length === 0
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="battery">Battery</SelectItem>
                    <SelectItem value="textile">Textile</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                  </SelectContent>
                </Select>
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

        <Card className="p-4 col-span-2">
          <FormField
            control={form.control}
            name="key_features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Features</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {(Array.isArray(field.value) ? field.value : []).map((feature: Json, index: number) => {
                      const keyFeature = convertToKeyFeature(feature);
                      return (
                        <div key={index} className="flex gap-4">
                          <Input
                            placeholder="Feature name"
                            value={keyFeature.name}
                            onChange={(e) => {
                              const newFeatures = [...(Array.isArray(field.value) ? field.value : [])];
                              newFeatures[index] = {
                                ...keyFeature,
                                name: e.target.value
                              };
                              field.onChange(newFeatures);
                            }}
                          />
                          <Input
                            placeholder="Value"
                            value={keyFeature.value}
                            onChange={(e) => {
                              const newFeatures = [...(Array.isArray(field.value) ? field.value : [])];
                              newFeatures[index] = {
                                ...keyFeature,
                                value: e.target.value
                              };
                              field.onChange(newFeatures);
                            }}
                          />
                          <Input
                            placeholder="Unit (optional)"
                            value={keyFeature.unit || ""}
                            onChange={(e) => {
                              const newFeatures = [...(Array.isArray(field.value) ? field.value : [])];
                              newFeatures[index] = {
                                ...keyFeature,
                                unit: e.target.value || undefined
                              };
                              field.onChange(newFeatures);
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const newFeatures = [...(Array.isArray(field.value) ? field.value : [])];
                              newFeatures.splice(index, 1);
                              field.onChange(newFeatures);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newFeature: KeyFeature = { name: "", value: "", unit: undefined };
                        field.onChange([...(Array.isArray(field.value) ? field.value : []), newFeature]);
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