import { z } from "zod";

export const documentSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.string(),
  url: z.string(),
  file: z.any().optional(),
  manufacturer_id: z.string().optional(),
  manufacturer_name: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Product description is required"),
  product_type: z.string().min(1, "Product type is required"),
  product_subcategory: z.string().min(1, "Product subcategory is required"),
  model: z.string().min(1, "Product model is required"),
  images: z
    .array(
      z.object({
        url: z.string().optional(),
        alt: z.string().optional(),
        is_primary: z.boolean(),
        fileObject: z.any().optional(),
      })
    )
    .default([]),
  key_features: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        unit: z.string().optional(),
      })
    )
    .default([]),
  documents: documentSchema.optional(),
  manufacturer_id: z.string().optional(),
  espr_compliance: z.object({
    directives: z.array(z.object({
      directive_number: z.string(),
      directive_name: z.string(),
      directive_description: z.string(),
      directive_edition_date: z.string(),
      sustainability_requirements: z.string(),
      environmental_impact: z.string(),
      circular_economy_criteria: z.string(),
      product_lifecycle_assessment: z.string(),
    })).optional(),
    regulations: z.array(z.object({
      regulation_number: z.string(),
      regulation_name: z.string(),
      regulation_description: z.string(),
      regulation_edition_date: z.string(),
      sustainability_criteria: z.string(),
      circular_economy_requirements: z.string(),
      environmental_impact_assessment: z.string(),
      resource_efficiency_requirements: z.string(),
    })).optional(),
    standards: z.array(z.object({
      ref_no: z.string(),
      title: z.string(),
      edition_date: z.string(),
      sustainability_metrics: z.string(),
      environmental_standards: z.string(),
      circular_economy_standards: z.string(),
      lifecycle_assessment_methodology: z.string(),
    })).optional(),
  }).optional(),
});

export type FormData = z.infer<typeof productSchema>; 