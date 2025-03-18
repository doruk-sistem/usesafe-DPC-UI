"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DPPTemplate } from "@/lib/types/dpp";
import { JSX } from "react";

// ✅ Zod Validasyon Şeması (Tam Tanımlı)
const templateSchema = z.object({
  hazard_pictograms: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      image_url: z.string().url(),
      description: z.string(),
    })
  ),
  materials: z.array(
    z.object({
      name: z.string(),
      percentage: z.number().min(0).max(100),
      cas_number: z.string().optional(),
      hazard_level: z.string().optional(),
      recyclable: z.boolean(),
    })
  ),
  health_safety_measures: z.array(
    z.object({
      category: z.string(),
      measures: z.array(z.string()),
    })
  ),
  emergency_procedures: z.array(
    z.object({
      scenario: z.string(),
      steps: z.array(z.string()),
    })
  ),
  storage_installation_guidelines: z.array(
    z.object({
      category: z.string(),
      guidelines: z.array(z.string()),
    })
  ),
  required_certifications: z.array(z.string()),
  optional_certifications: z.array(z.string()),
});

type FormData = z.infer<typeof templateSchema>;

interface DPPTemplateFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  defaultValues?: Partial<FormData>;
}

export function DPPTemplateForm({ onSubmit, defaultValues }: DPPTemplateFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: defaultValues || {
      hazard_pictograms: [],
      materials: [],
      health_safety_measures: [],
      emergency_procedures: [],
      storage_installation_guidelines: [],
      required_certifications: [],
      optional_certifications: [],
    },
  });

  // Dinamik alanlar için fieldArray
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "hazard_pictograms", 
  });

  const renderFieldArray = (
    name: keyof FormData,
    label: string,
    renderItem: (index: number) => JSX.Element
  ) => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{label}</h3>
      {form.watch(name).map((_, index) => (
        <div key={index} className="mb-4 space-y-2">
          {renderItem(index)}
          <Button
            type="button"
            variant="destructive"
            onClick={() => remove(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() =>
          append({
            id: "",
            name: "",
            image_url: "",
            description: "",
          } as never)
        }
      >
        Add {label}
      </Button>
    </Card>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {renderFieldArray("hazard_pictograms", "Hazard Pictograms", (index) => (
          <>
            <FormField
              control={form.control}
              name={`hazard_pictograms.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`hazard_pictograms.${index}.image_url`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ))}

        {renderFieldArray("materials", "Materials", (index) => (
          <>
            <FormField
              control={form.control}
              name={`materials.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ))}

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Required Certifications</h3>
          <FormField
            control={form.control}
            name="required_certifications"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} placeholder="Add required certifications" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Optional Certifications</h3>
          <FormField
            control={form.control}
            name="optional_certifications"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} placeholder="Add optional certifications" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Save Template</Button>
        </div>
      </form>
    </Form>
  );
}