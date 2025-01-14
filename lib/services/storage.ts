import { StorageHelper } from '@/lib/utils/storage';

export class StorageService {
  private static readonly PRODUCT_IMAGES_BUCKET = process.env.NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET;

  static async uploadProductImage(file: File | string, companyId: string): Promise<string | null> {
    try {
      if (!this.PRODUCT_IMAGES_BUCKET) {
        throw new Error('Product images bucket name is not configured');
      }

      // Convert blob URL to File object if needed
      let imageFile: File;
      if (typeof file === 'string' && file.startsWith('blob:')) {
        const response = await fetch(file);
        const blob = await response.blob();
        imageFile = new File([blob], 'product-image.jpg', { type: 'image/jpeg' });
      } else {
        imageFile = file as File;
      }

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${companyId}/products/${fileName}`;

      return await StorageHelper.uploadFile(imageFile, {
        bucketName: this.PRODUCT_IMAGES_BUCKET
      }, filePath);

    } catch (error) {
      console.error('Error in uploadProductImage:', error);
      return null;
    }
  }

  static async deleteProductImage(url: string): Promise<boolean> {
    try {
      if (!this.PRODUCT_IMAGES_BUCKET) {
        throw new Error('Product images bucket name is not configured');
      }

      const path = url.split('/').pop();
      if (!path) return false;

      return await StorageHelper.deleteFile(path, {
        bucketName: this.PRODUCT_IMAGES_BUCKET
      });

    } catch (error) {
      console.error('Error in deleteProductImage:', error);
      return false;
    }
  }
}