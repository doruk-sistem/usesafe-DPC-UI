export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
  updated_at: string;
  status: string;
  rejection_reason?: string;
  metadata?: Record<string, any>;
}

export interface DocumentWithMetadata extends Document {
  metadata: {
    [key: string]: any;
  };
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