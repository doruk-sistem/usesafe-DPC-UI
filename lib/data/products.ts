import { Product } from "@/lib/types/product";

import { textileProducts } from "./textile-products";

// Tüm ürünleri birleştir
export const allProducts: Product[] = [
  ...textileProducts,
  // Diğer ürün kategorileri buraya eklenecek
];

// Ürün ID'sine göre bul
export function findProductById(id: string): Product | undefined {
  return allProducts.find(product => product.id === id);
}

// products olarak da export et (geriye dönük uyumluluk için)
export const products = allProducts;