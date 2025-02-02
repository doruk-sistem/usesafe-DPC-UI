import { StatusTransition, ProductImage, KeyFeature } from "./product"

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
          model: string
          status: "DRAFT" | "NEW" | "DELETED" | "ARCHIVED"
          status_history: StatusTransition[]
          images: ProductImage[]
          key_features: KeyFeature[]
          created_at: string
          updated_at: string
          documents?: Json
          manufacturer_id: string
        }
        Insert: {
          id?: string
          name: string
          description: string | null
          company_id: string
          product_type: string
          model: string
          status?: 'DRAFT' | 'NEW' | 'DELETED' | 'ARCHIVED'
          status_history?: StatusTransition[]
          images: {
            url: string;
            alt: string;
            is_primary: boolean;
          }[]
          key_features?: Json[]
          created_at?: string
          updated_at?: string
          documents?: Json
          manufacturer_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          company_id?: string
          status?: 'DRAFT' | 'NEW' | 'DELETED' | 'ARCHIVED'
          status_history?: StatusTransition[]
          images?: {
            url: string;
            alt: string;
            is_primary: boolean;
          }[]
          key_features?: Json[]
          created_at?: string
          updated_at?: string
          product_type?: string
          model?: string
          documents?: Json
          manufacturer_id: string
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