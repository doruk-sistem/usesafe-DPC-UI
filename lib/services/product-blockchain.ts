import { ProductBlockchainRecord, ProductBlockchainAction } from '../types/product-blockchain';
import { productBlockchainContractService } from './product-blockchain-contract';

class ProductBlockchainService {
  private static instance: ProductBlockchainService;
  private contractAddresses: Map<string, string>;

  private constructor() {
    this.contractAddresses = new Map();
  }

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
  ): Promise<{ transactionId: string; contractAddress: string }> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    try {
      let transactionId: string;
      let contractAddress: string;

      switch (action) {
        case 'CREATE':
          transactionId = await productBlockchainContractService.createProduct(
            id,
            name,
            manufacturer,
            description,
            'product', // productType - varsayılan değer
            'default'  // model - varsayılan değer
          );
          break;

        case 'UPDATE':
          transactionId = await productBlockchainContractService.updateProduct(
            id,
            name,
            manufacturer,
            description,
            'product', // productType - varsayılan değer
            'default'  // model - varsayılan değer
          );
          break;

        case 'DELETE':
          transactionId = await productBlockchainContractService.deactivateProduct(id);
          break;

        default:
          throw new Error('Invalid action type');
      }

      return { transactionId, contractAddress };
    } catch (error) {
      console.error('Error recording product action:', error);
      throw error;
    }
  }

  async getProductHistory(productId?: string): Promise<ProductBlockchainRecord[]> {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const product = await productBlockchainContractService.getProduct(productId);
      
      return [{
        id: productId,
        name: product.name,
        manufacturer: product.manufacturer,
        description: product.description,
        action: 'CREATE',
        timestamp: product.createdAt.toISOString(),
      }];
    } catch (error) {
      console.error('Error fetching product history:', error);
      throw error;
    }
  }
}

export const productBlockchainService = ProductBlockchainService.getInstance(); 