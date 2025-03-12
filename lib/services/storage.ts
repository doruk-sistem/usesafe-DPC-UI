import { StorageHelper } from '@/lib/utils/storage';

export class StorageService {
  private static readonly PRODUCT_IMAGES_BUCKET = process.env.NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET;

  static async  uploadProductImage(file: File | string, companyId: string): Promise<string | null> {
    try {
      const bucketName = this.PRODUCT_IMAGES_BUCKET;
      if (!bucketName) {
        console.error('Product images bucket name is not configured properly');
        throw new Error('Product images bucket name is not configured');
      }

      // Handle the file appropriately based on its type
      let imageFile: File;
      
      if (typeof file === 'string' && file.startsWith('blob:')) {
        throw new Error('Blob URLs cannot be processed directly due to CSP restrictions. Pass the File object instead.');
      } else if (file instanceof File) {
        imageFile = file;
      } else {
        throw new Error('Invalid file format');
      }

      // Get a clean file extension
      const fileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileExt = fileName.split('.').pop() || 'jpg';
      
      // Create a safe file path that won't contain any special characters
      const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${companyId}/products/${safeFileName}`;

      return await StorageHelper.uploadFile(imageFile, {
        bucketName: bucketName
      }, filePath);

    } catch (error) {
      console.error('Error in uploadProductImage:', error);
      return null;
    }
  }

  static async deleteProductImage(url: string): Promise<boolean> {
    try {
      const bucketName = this.PRODUCT_IMAGES_BUCKET;
      if (!bucketName) {
        console.error('Product images bucket name is not configured properly');
        throw new Error('Product images bucket name is not configured');
      }

      // Extract path properly from the URL
      // Example URL: https://udmyjobxsovqdshhavus.supabase.co/storage/v1/object/public/product-images/companyId/products/filename.jpg
      // We need to extract: companyId/products/filename.jpg
      
      const urlParts = url.split('/');
      const publicIndex = urlParts.indexOf('public');
      
      if (publicIndex === -1 || publicIndex + 2 >= urlParts.length) {
        console.error('Invalid storage URL format:', url);
        return false;
      }
      
      // The path starts after the bucket name in the URL
      const fullPath = urlParts.slice(publicIndex + 2).join('/');
      console.log('Deleting file from path:', fullPath);
      
      return await StorageHelper.deleteFile(fullPath, {
        bucketName: bucketName
      });

    } catch (error) {
      console.error('Error in deleteProductImage:', error);
      return false;
    }
  }
}