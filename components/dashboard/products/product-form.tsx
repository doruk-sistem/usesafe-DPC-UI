"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { NewProduct } from "@/lib/types/product";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Product description is required"),
  product_type: z.string().min(1, "Product type is required"),
  model: z.string().min(1, "Product model is required"),
  images: z.array(z.object({
    url: z.string().optional(),
    alt: z.string(),
    is_primary: z.boolean()
  })).default([]),
  key_features: z.array(z.object({
    name: z.string(),
    value: z.string(),
    unit: z.string().optional()
  })).default([]),
});

interface ProductFormProps {
  onSubmit: (data: NewProduct) => Promise<void>;
  defaultValues?: Partial<NewProduct>;
}

export function ProductForm({ onSubmit, defaultValues }: ProductFormProps) {
  const form = useForm<NewProduct>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      product_type: "",
      model: "",
      images: [],
      key_features: []
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                            // Here you would normally upload the file and get the URL
                            // For now, we'll use a fake URL
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
                <FormLabel>Category</FormLabel>
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
                    {field.value.map((feature, index) => (
                      <div key={index} className="flex gap-4">
                        <Input
                          placeholder="Feature name"
                          value={feature.name}
                          onChange={(e) => {
                            const newFeatures = [...(field.value || [])];
                            newFeatures[index] = {
                              ...feature,
                              name: e.target.value
                            };
                            field.onChange(newFeatures);
                          }}
                        />
                        <Input
                          placeholder="Value"
                          value={feature.value}
                          onChange={(e) => {
                            const newFeatures = [...(field.value || [])];
                            newFeatures[index] = {
                              ...feature,
                              value: e.target.value
                            };
                            field.onChange(newFeatures);
                          }}
                        />
                        <Input
                          placeholder="Unit (optional)"
                          value={feature.unit || ""}
                          onChange={(e) => {
                            const newFeatures = [...(field.value || [])];
                            newFeatures[index] = {
                              ...feature,
                              unit: e.target.value
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
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        field.onChange([
                          ...field.value,
                          { name: "", value: "", unit: "" }
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

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">
            {defaultValues ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

const handleSubmit = async (data: NewProduct) => {
  if (!user?.id) return;

  try {
    // Upload image if provided
    const uploadedImages = await Promise.all(
      data.images.map(async (image) => {
        if (image.url.startsWith('blob:')) {
          const uploadedUrl = await StorageService.uploadProductImage(image.url, user.id);
          return {
            ...image,
            url: uploadedUrl || image.url
          };
        }
        return image;
      })
    );

    if (!uploadedImages.some(img => img.url)) {
        toast({
          title: "Error",
          description: "Failed to upload product image",
          variant: "destructive",
        });
        return;
    }

    const response = await ProductService.createProduct({
      ...data,
      images: uploadedImages,
      company_id: user.id,
      status: "DRAFT"
    });
  } catch (error) {
    // Handle error
  }
};