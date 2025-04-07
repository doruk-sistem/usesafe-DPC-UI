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

      // If manufacturer is empty, use a default value
      const manufacturerValue = manufacturer || 'Unknown Manufacturer';

      switch (action) {
        case 'CREATE':
          transactionId = await productBlockchainContractService.createProduct(
            id,
            name,
            manufacturerValue,
            description,
            'product', // productType - varsayılan değer
            'default'  // model - varsayılan değer
          );
          break;

        case 'UPDATE':
          transactionId = await productBlockchainContractService.updateProduct(
            id,
            name,
            manufacturerValue,
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

      // First try to get the product data with improved error handling
      let product;
      try {
        product = await productBlockchainContractService.getProduct(productId);
      } catch (error) {
        console.error('Error fetching product from blockchain:', error);
        // Return a placeholder history record with error information
        return [{
          id: productId,
          name: 'Product information unavailable',
          manufacturer: 'Unknown',
          description: 'Unable to retrieve product data from blockchain',
          action: 'CREATE',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }];
      }
      
      // Create history records including creation and update events
      const history: ProductBlockchainRecord[] = [];
      
      // Add creation record
      history.push({
        id: productId,
        name: product.name,
        manufacturer: product.manufacturer,
        description: product.description,
        productType: product.productType,
        model: product.model,
        action: 'CREATE',
        timestamp: product.createdAt.toISOString(),
      });
      
      // Add update record if created and updated timestamps are different
      if (product.createdAt.getTime() !== product.updatedAt.getTime()) {
        history.push({
          id: productId,
          name: product.name,
          manufacturer: product.manufacturer,
          description: product.description,
          productType: product.productType,
          model: product.model,
          action: 'UPDATE',
          timestamp: product.updatedAt.toISOString(),
        });
      }
      
      return history;
    } catch (error) {
      console.error('Error fetching product history:', error);
      // Return a placeholder history with error info
      return [{
        id: productId || 'unknown',
        name: 'Error retrieving history',
        manufacturer: 'Error',
        description: `Failed to retrieve product history: ${error instanceof Error ? error.message : 'Unknown error'}`,
        action: 'CREATE',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }];
    }
  }
}

export const productBlockchainService = ProductBlockchainService.getInstance(); 