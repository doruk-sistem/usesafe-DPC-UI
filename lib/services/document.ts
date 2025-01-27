import { supabase } from '@/lib/supabase';

interface StorageOptions {
  bucketName: string;
  companyId: string;
  productId?: string;
}

export class DocumentService {
  private static readonly DOCUMENTS_BUCKET = process.env.NEXT_PUBLIC_PRODUCT_DOCUMENTS_BUCKET || 'product-documents';

  static async uploadDocument(file: File, options: StorageOptions): Promise<string | null> {
    try {
      // Sanitize filename by removing special characters and spaces
      const sanitizedName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-zA-Z0-9.-]/g, '_'); // Replace special chars with underscore

      // Create path with sanitized filename
      const path = options.productId
        ? `${options.companyId}/${options.productId}/${Date.now()}-${sanitizedName}`
        : `${options.companyId}/temp/${Date.now()}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from(this.DOCUMENTS_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type // Set proper content type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(this.DOCUMENTS_BUCKET)
        .getPublicUrl(path);

      return publicUrl;
    } catch (err) {
      console.error('Document upload error:', err);
      throw err; // Re-throw to handle in the component
    }
  }

  static async uploadMultipleDocuments(
    files: { file: File; type: string }[],
    options: StorageOptions
  ): Promise<{ [key: string]: string[] }> {
    const uploadedDocs: { [key: string]: string[] } = {};

    for (const { file, type } of files) {
      const url = await this.uploadDocument(file, {
        ...options,
        bucketName: this.DOCUMENTS_BUCKET
      });

      if (url) {
        if (!uploadedDocs[type]) {
          uploadedDocs[type] = [];
        }
        uploadedDocs[type].push(url);
      }
    }

    return uploadedDocs;
  }

  static async deleteDocument(url: string): Promise<boolean> {
    try {
      const path = url.split('/').pop();
      if (!path) return false;

      const { error } = await supabase.storage
        .from(this.DOCUMENTS_BUCKET)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Document deletion error:', err);
      return false;
    }
  }
}