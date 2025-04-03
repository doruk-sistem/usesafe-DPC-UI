import type { Document } from "./document";
import type { KeyFeature, ProductImage, ProductStatus } from "./product";
import type { NewProduct } from "./product";

export type ProductFormData = Omit<NewProduct, 'company_id'> & {
  company_id?: string;
}; 