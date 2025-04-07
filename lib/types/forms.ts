import type { Document } from "./document";
import type { KeyFeature, ProductImage, ProductStatus , NewProduct } from "./product";


export type ProductFormData = Omit<NewProduct, 'company_id'> & {
  company_id?: string;
}; 