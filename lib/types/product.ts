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

export type BaseProduct = Database["public"]["Tables"]["products"]["Row"] & {
  manufacturer?: {
    id: string;
    name: string;
  };
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

export type NewProduct = Database["public"]["Tables"]["products"]["Insert"];
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

export interface Product {
  id: string;
  name: string;
  description: string;
  model: string;
  product_type: string;
  images: Array<{
    url: string;
    alt?: string;
    is_primary?: boolean;
  }>;
  key_features: Array<{
    name: string;
    value: string | number;
  }>;
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
}
