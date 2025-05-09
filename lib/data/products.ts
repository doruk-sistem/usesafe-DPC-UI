import { Product } from "@/lib/types/product";
import { textileProducts } from "./textile-products";
import { detergentProducts } from "./detergent-products";

// Tüm ürünleri birleştir
export const allProducts: Product[] = [
  ...textileProducts,
  ...detergentProducts,
  // Diğer ürün kategorileri buraya eklenecek
];

// Ürün ID'sine göre bul
export function findProductById(id: string): Product | undefined {
  return allProducts.find(product => product.id === id);
}