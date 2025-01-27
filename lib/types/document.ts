export interface Document {
  name: string;
  url: string;
  type: string;
}

export type DocumentType = 
  | 'quality_cert'
  | 'safety_cert' 
  | 'test_reports'
  | 'technical_docs'
  | 'compliance_docs';