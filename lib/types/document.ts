export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  category?: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
  uploadedAt?: string;
  status: string;
  rejection_reason?: string;
  metadata?: Record<string, any>;
  manufacturerId?: string;
  manufacturer?: string;
  productId?: string;
  fileSize?: string;
  validUntil?: string;
  version?: string;
  notes?: string;
  filePath?: string;
  file?: File; // File objesi için eklendi
  originalType?: string; // AI'dan gelen orijinal tür
  companyId?: string; // Company ID for company documents
}

export interface DocumentWithMetadata extends Document {
  metadata: {
    [key: string]: any;
  };
}

// Sertifika tipleri
export type CertificateType = 
  | 'quality_certificate'
  | 'safety_certificate'
  | 'environmental_certificate'
  | 'iso_certificate'
  | 'export_certificate'
  | 'production_certificate'
  | 'activity_permit';  

// Döküman tipleri
export type DocumentType = 
  | 'signature_circular'
  | 'trade_registry_gazette'
  | 'tax_plate'
  | 'activity_certificate';  // Faaliyet Belgesi (döküman)

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}