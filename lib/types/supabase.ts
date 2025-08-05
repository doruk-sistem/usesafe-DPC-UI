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
          weight?: number
          status: ProductStatus
          status_history: StatusTransition[]
          images: ProductImage[]
          key_features: KeyFeature[]
          created_at: string
          updated_at: string
          manufacturer_id: string
          documents?: Document[]
          document_status?: string
        }
        Insert: {
          id?: string
          name: string
          description: string | null
          company_id: string
          product_type: string
          product_subcategory: string
          model: string
          weight?: number
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
          document_status?: string
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
          weight?: number
          documents?: Document[]
          manufacturer_id?: string
          document_status?: string
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