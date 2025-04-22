import { StorageHelper } from "@/lib/utils/storage";

export function useImageUrl() {
  const getImageUrl = (url?: string, bucketName?: string): string => {
    if (!url) return "/images/placeholder-product.png";
    if (url.startsWith("http")) return url;

    try {
      return StorageHelper.getPublicUrl(url, {
        bucketName: bucketName || process.env.NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET || "",
      });
    } catch (error) {
      return "/images/placeholder-product.png";
    }
  };

  return { getImageUrl };
} 