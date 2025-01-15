export enum AddressType {
  HEADQUARTERS = 'headquarters',
  BRANCH = 'branch',
  FACTORY = 'factory',
  WAREHOUSE = 'warehouse'
}

export enum DocumentType {
  SIGNATURE_CIRCULAR = 'signature_circular',
  TRADE_REGISTRY_GAZETTE = 'trade_registry_gazette',
  TAX_PLATE = 'tax_plate',
  ACTIVITY_CERTIFICATE = 'activity_certificate',
  ISO_CERTIFICATE = 'iso_certificate',
  QUALITY_CERTIFICATE = 'quality_certificate',
  EXPORT_CERTIFICATE = 'export_certificate',
  PRODUCTION_PERMIT = 'production_permit'
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Company {
  id: string;
  name: string;
  taxInfo: {
    taxNumber: string;
    tradeRegistryNo?: string;
    mersisNo?: string;
  };
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyAddress {
  id: string;
  companyId: string;
  type: AddressType;
  street: string;
  city: string;
  district: string;
  postalCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyDocument {
  id: string;
  companyId: string;
  type: DocumentType;
  filePath: string;
  status: DocumentStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
} 