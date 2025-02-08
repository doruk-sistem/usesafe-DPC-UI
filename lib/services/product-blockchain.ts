import { ProductBlockchainRecord, ProductBlockchainAction } from '../types/product-blockchain';
import { productBlockchainContractService } from './product-blockchain-contract';
import { supabase } from '@/lib/supabase';

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

  // Contract adreslerini veritabanından yükle
  private async loadContractAddress(productId: string): Promise<string | null> {
    try {
      // Önce memory cache'e bak
      const cachedAddress = this.contractAddresses.get(productId);
      if (cachedAddress) {
        return cachedAddress;
      }

      // Veritabanından oku
      const { data, error } = await supabase
        .from('products')
        .select('contract_address')
        .eq('id', productId)
        .single();

      if (error) {
        throw error;
      }

      if (data?.contract_address) {
        // Memory cache'e kaydet
        this.contractAddresses.set(productId, data.contract_address);
        return data.contract_address;
      }

      return null;
    } catch (error) {
      console.error('Error loading contract address:', error);
      return null;
    }
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
          contractAddress = await productBlockchainContractService.createProduct(
            id,
            name,
            manufacturer,
            description,
            'product', // productType - varsayılan değer
            'default'  // model - varsayılan değer
          );
          this.contractAddresses.set(id, contractAddress);
          transactionId = contractAddress; // createProduct artık contract address dönüyor
          break;

        case 'UPDATE':
          contractAddress = await this.loadContractAddress(id);
          if (!contractAddress) {
            throw new Error('Contract address not found for product');
          }
          transactionId = await productBlockchainContractService.updateProduct(
            id,
            contractAddress,
            name,
            manufacturer,
            description,
            'product', // productType - varsayılan değer
            'default'  // model - varsayılan değer
          );
          break;

        case 'DELETE':
          contractAddress = await this.loadContractAddress(id);
          if (!contractAddress) {
            throw new Error('Contract address not found for product');
          }
          transactionId = await productBlockchainContractService.deactivateProduct(id, contractAddress);
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

      const contractAddress = await this.loadContractAddress(productId);
      if (!contractAddress) {
        throw new Error('Contract address not found for product');
      }

      const product = await productBlockchainContractService.getProduct(productId, contractAddress);
      
      return [{
        id: productId,
        name: product.name,
        manufacturer: product.manufacturer,
        description: product.description,
        action: 'CREATE',
        timestamp: product.createdAt.toISOString(),
        contractAddress: contractAddress
      }];
    } catch (error) {
      console.error('Error fetching product history:', error);
      throw error;
    }
  }

  // Contract adresini kaydetmek için yeni metod
  async setContractAddress(productId: string, contractAddress: string) {
    try {
      // Veritabanına kaydet
      const { error } = await supabase
        .from('products')
        .update({ contract_address: contractAddress })
        .eq('id', productId);

      if (error) {
        throw error;
      }

      // Memory cache'e kaydet
      this.contractAddresses.set(productId, contractAddress);
    } catch (error) {
      console.error('Error setting contract address:', error);
      throw error;
    }
  }

  // Contract adresini almak için yeni metod
  async getContractAddress(productId: string): Promise<string | null> {
    return this.loadContractAddress(productId);
  }
}

export const productBlockchainService = ProductBlockchainService.getInstance(); 