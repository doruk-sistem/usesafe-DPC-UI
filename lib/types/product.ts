import { Database } from "./supabase";
import { Document } from "./document";

export type DPPFieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "material"
  | "certification";

export type MaterialValue = {
  percentage: number;
  recyclable: boolean;
  description: string;
};

export type CertificationValue = {
  issuedBy: string;
  validUntil: string;
  status: "valid" | "expired";
  documentUrl?: string;
};

export type DPPFieldValue =
  | string
  | number
  | string[]
  | MaterialValue
  | CertificationValue;

export type DPPField = {
  id: string;
  name: string;
  type: DPPFieldType;
  required: boolean;
  value?: DPPFieldValue;
  options?: string[];
};

export type DPPSection = {
  id: string;
  title: string;
  fields: DPPField[];
  required: boolean;
  order: number;
};

export type DPPConfig = {
  sections: DPPSection[];
  lastUpdated: string;
};

export type BaseProduct = Database["public"]["Tables"]["products"]["Row"] & {
  manufacturer?: {
    id: string;
    name: string;
  };
  key_features?: ProductKeyFeature[]; // Yeni ilişkisel key_features
  documents?: Document[]; // Documents array for the product
  dpp_config?: {
    sections: Array<{
      id: string;
      type: string;
      fields: Array<{
        id: string;
        name: string;
        type: string;
        value: any;
      }>;
    }>;
  };
};

export type NewProduct = Database["public"]["Tables"]["products"]["Insert"] & {
  // espr_compliance?: {
  //   directives: Array<{
  //     directive_number: string;
  //     directive_name: string;
  //     directive_description: string;
  //     directive_edition_date: string;
  //     sustainability_requirements: string;
  //     environmental_impact: string;
  //     circular_economy_criteria: string;
  //     product_lifecycle_assessment: string;
  //   }>;
  //   regulations: Array<{
  //     regulation_number: string;
  //     regulation_name: string;
  //     regulation_description: string;
  //     regulation_edition_date: string;
  //     sustainability_criteria: string;
  //     circular_economy_requirements: string;
  //     environmental_impact_assessment: string;
  //     resource_efficiency_requirements: string;
  //   }>;
  //   standards: Array<{
  //     ref_no: string;
  //     title: string;
  //     edition_date: string;
  //     sustainability_metrics: string;
  //     environmental_standards: string;
  //     circular_economy_standards: string;
  //     lifecycle_assessment_methodology: string;
  //   }>;
  // };
};

export type UpdateProduct = Database["public"]["Tables"]["products"]["Update"];
export type ProductStatus =
  | "DRAFT"
  | "NEW"
  | "DELETED"
  | "ARCHIVED"
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "EXPIRED"
  | null;

export interface StatusTransition {
  from: ProductStatus;
  to: ProductStatus;
  timestamp: string;
  userId: string;
  reason?: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  is_primary: boolean;
  fileObject?: File;
}

export type ProductImageJson = {
  [K in keyof ProductImage]: ProductImage[K];
};

// Eski KeyFeature interface'i (form için kullanılacak)
export interface KeyFeature {
  name: string;
  value: string;
  unit?: string;
}

// Yeni ProductKeyFeature interface'i (veritabanı için)
export interface ProductKeyFeature {
  id: string;
  product_id: string;
  name: string;
  value: string;
  unit?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductError {
  message: string;
  field?: string;
}

export interface ProductValidationResult {
  isValid: boolean;
  errors: ProductError[];
}

export interface ProductResponse {
  data?: BaseProduct;
  error?: ProductError;
}
