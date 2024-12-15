import { Database } from './supabase';

export type Product = Database['public']['Tables']['products']['Row'];
export type NewProduct = Database['public']['Tables']['products']['Insert'];
export type UpdateProduct = Database['public']['Tables']['products']['Update'];

export type ProductStatus = 'DRAFT' | 'NEW' | 'DELETED' | 'ARCHIVED';

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
}

export type ProductImageJson = {
  [K in keyof ProductImage]: ProductImage[K];
}

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
  data?: Product;
  error?: ProductError;
}

// export interface Product {
//   id: string
//   name: string
//   description: string
//   company_id: string
//   product_type: string
//   model: string
//   status: ProductStatus
//   status_history: StatusTransition[]
//   images: Json[]
//   key_features: Json[]
//   created_at: string
//   updated_at: string
// }