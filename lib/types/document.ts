export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  manufacturer: string;
  manufacturerId: string;
  productId?: string;
  status: DocumentStatus;
  validUntil?: string;
  uploadedAt?: string;
  fileSize?: string;
  version?: string;
  url: string;
  rejection_reason?: string;
  rejection_date?: string;
}

export type DocumentType = 
  | 'quality_cert'
  | 'safety_cert' 
  | 'test_reports'
  | 'technical_docs'
  | 'compliance_docs';

export type DocumentStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired';