import { supabase } from '@/lib/supabase';
import type { NewProduct, Product, ProductResponse, UpdateProduct } from '@/lib/types/product';
import { validateAndMapDocuments } from '@/lib/utils/document-mapper';

export class ProductService {
  static async getProducts(companyId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }

    return data || [];
  }

  static async getProduct(id: string, companyId: string): Promise<ProductResponse> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (error) {
      return { error: { message: 'Product not found' } };
    }

    return { data };
  }

  static async createProduct(product: NewProduct): Promise<ProductResponse> {
    try {
      // Extract documents if they exist, otherwise use empty object
      const { documents = {}, ...productData } = product;
      // Validate and map documents with type assertion to fix lint error
      const validatedDocuments = validateAndMapDocuments(documents as Record<string, any[]>);

      // Create the product with document URLs
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          documents: Object.keys(validatedDocuments).length > 0 ? validatedDocuments : null
        }])
        .select()
        .single();

      if (error) {
        console.error('Product creation error:', error);
        return { 
          error: { 
            message: 'Failed to create product',
            field: error.details 
          } 
        };
      }

      return { data };
    } catch (error) {
      console.error('Error in createProduct:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }

  static async updateProduct(id: string, product: UpdateProduct): Promise<ProductResponse> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { 
        error: { 
          message: 'Failed to update product',
          field: error.details 
        } 
      };
    }

    return { data };
  }

  static async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }

    return true;
  }
}