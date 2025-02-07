import { ProductBlockchainRecord, ProductBlockchainAction } from '../types/product-blockchain';

class ProductBlockchainService {
  private static instance: ProductBlockchainService;

  private constructor() {}

  public static getInstance(): ProductBlockchainService {
    if (!ProductBlockchainService.instance) {
      ProductBlockchainService.instance = new ProductBlockchainService();
    }
    return ProductBlockchainService.instance;
  }

  async recordProductAction(
    id: string,
    name: string,
    manufacturer: string,
    description: string,
    action: ProductBlockchainAction
  ): Promise<{ transactionId: string }> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    try {
      const response = await fetch('/api/hedera/topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          name,
          manufacturer,
          description,
          action,
          recordedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record product action');
      }

      const data = await response.json();
      
      if (!data.transactionId) {
        throw new Error('No transaction ID returned from blockchain');
      }

      return { transactionId: data.transactionId };
    } catch (error) {
      console.error('Error recording product action:', error);
      throw error;
    }
  }

  async getProductHistory(productId?: string): Promise<ProductBlockchainRecord[]> {
    try {
      const response = await fetch('/api/hedera/topic');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch product history');
      }

      const data = await response.json();
      
      if (!data.messages) {
        console.warn('No messages found in response:', data);
        return [];
      }
      
      const messages = data.messages.filter((msg: any) => {
        if (!msg || typeof msg !== 'object') {
          console.warn('Invalid message format:', msg);
          return false;
        }
        return !productId || msg.id === productId;
      });

      return messages;
    } catch (error) {
      console.error('Error fetching product history:', error);
      throw error;
    }
  }
}

export const productBlockchainService = ProductBlockchainService.getInstance(); 