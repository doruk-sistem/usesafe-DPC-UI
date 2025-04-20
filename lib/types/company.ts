import { DocumentStatus } from "./document";

export enum AddressType {
  HEADQUARTERS = "headquarters",
  BRANCH = "branch",
  FACTORY = "factory",
  WAREHOUSE = "warehouse",
  OFFICE = "office",
}

export enum CompanyType {
  MANUFACTURER = "manufacturer",
  BRAND_OWNER = "brand_owner",
  MATERIAL_SUPPLIER = "material_supplier",
  FACTORY = "factory",
  ADMIN = "admin",
}


export enum CompanyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
}

export enum DocumentType {
  SIGNATURE_CIRCULAR = "signature_circular",
  TRADE_REGISTRY_GAZETTE = "trade_registry_gazette",
  TAX_PLATE = "tax_plate",
  ACTIVITY_CERTIFICATE = "activity_certificate",
  ISO_CERTIFICATE = "iso_certificate",
  QUALITY_CERTIFICATE = "quality_certificate",
  EXPORT_CERTIFICATE = "export_certificate",
  PRODUCTION_PERMIT = "production_permit",
}

export interface Company {
  id: string;
  name: string;
  companyType: CompanyType;
  taxInfo: {
    taxNumber: string;
    tradeRegistryNo?: string;
    mersisNo?: string;
  };
  // status tipini boolean'dan CompanyStatus'a değiştirin
  status: CompanyStatus;
  email?: string;
  phone?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CompanyAddress {
  id: string;
  companyId: string;
  type: AddressType;
  street: string;
  city: string;
  district: string;
  postalCode?: string;
  country?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CompanyDocument {
  id: string;
  companyId: string;
  type: DocumentType;
  filePath: string;
  status: DocumentStatus;
  rejectionReason?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CompanyContact {
  id: string;
  companyId: string;
  name: string;
  position?: string;
  email: string;
  phone?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CompanyStats {
  total: number;
  active: number;
  pending: number;
  categories: Array<{ name: string; count: number }>;
}