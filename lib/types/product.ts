import { Database } from "./supabase";

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

export type BaseProduct = Database["public"]["Tables"]["products"]["Row"];
export type NewProduct = Database["public"]["Tables"]["products"]["Insert"];
export type UpdateProduct = Database["public"]["Tables"]["products"]["Update"];
export type ProductStatus =
  | "DRAFT"
  | "NEW"
  | "DELETED"
  | "ARCHIVED"
  | "approved"
  | "pending"
  | "rejected"
  | "expired"
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

export interface KeyFeature {
  name: string;
  value: string;
  unit?: string;
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

export type ProductWithMetadata = {
  id: string;
  name: string;
  description: string;
  company_id: string;
  product_type: string;
  product_subcategory: string;
  model?: string;
  status: ProductStatus;
  status_history: StatusTransition[];
  images: ProductImage[];
  key_features: KeyFeature[];
  created_at: string;
  updated_at: string;
  manufacturer_id: string;
  documents?: any[];
  manufacturer_name: string;
  document_count: number;
  document_status: "All Approved" | "Pending Review" | "Has Rejected Documents" | "No Documents";
};

export type Product = BaseProduct & {
  status: ProductStatus;
  status_history: StatusTransition[];
  images: ProductImage[];
  key_features: KeyFeature[];
  manufacturer_name: string;
  document_count: number;
  document_status: "All Approved" | "Pending Review" | "Has Rejected Documents" | "No Documents";
};
