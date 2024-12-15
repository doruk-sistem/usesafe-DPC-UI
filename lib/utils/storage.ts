import { supabase } from '@/lib/supabase';

interface StorageOptions {
  bucketName: string;
}

export class StorageHelper {
  static async uploadFile(file: File, options: StorageOptions, path?: string): Promise<string | null> {
    try {
      const filePath = path || `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from(options.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(options.bucketName)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  }

  static async deleteFile(path: string, options: StorageOptions): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(options.bucketName)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    }
  }

  static getPublicUrl(path: string, options: StorageOptions): string {
    const { data: { publicUrl } } = supabase.storage
      .from(options.bucketName)
      .getPublicUrl(path);
    
    return publicUrl;
  }
}
