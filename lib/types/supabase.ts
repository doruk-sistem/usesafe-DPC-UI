import { Document } from "./document"
import { StatusTransition, ProductImage, KeyFeature, ProductStatus } from "./product"


export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          company_id: string
          product_type: string
          product_subcategory: string
          model?: string
          status: ProductStatus
          status_history: StatusTransition[]
          images: ProductImage[]
          key_features: KeyFeature[]
          created_at: string
          updated_at: string
          manufacturer_id: string
          documents?: Document[]
        }
        Insert: {
          id?: string
          name: string
          description: string | null
          company_id: string
          product_type: string
          product_subcategory: string
          model: string
          status?: ProductStatus
          status_history?: StatusTransition[]
          images: {
            url: string;
            alt: string;
            is_primary: boolean;
          }[]
          key_features?: KeyFeature[]
          created_at?: string
          updated_at?: string
          documents?: Document[];
          manufacturer_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          company_id?: string
          status?: ProductStatus
          status_history?: StatusTransition[]
          images?: {
            url: string;
            alt: string;
            is_primary: boolean;
          }[]
          key_features?: KeyFeature[]
          created_at?: string
          updated_at?: string
          product_type?: string
          product_subcategory?: string
          model?: string
          documents?: Document[]
          manufacturer_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}