export type ProductBlockchainAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface ProductBlockchainRecord {
  id: string;
  name: string;
  manufacturer: string;
  description: string;
  productType?: string;
  model?: string;
  action: ProductBlockchainAction;
  timestamp?: string;
  sequenceNumber?: number;
  error?: string;
}

export interface ProductBlockchainResponse {
  status: 'success' | 'error';
  transactionId?: string;
  contractAddress?: string;
  message: string;
  details?: string;
}

export interface ProductBlockchainHistoryResponse {
  status: 'success' | 'error';
  messages?: ProductBlockchainRecord[];
  message: string;
  details?: string;
} 