export interface DocumentRequirement {
  type: string;
  label: string;
  required: boolean;
  description: string;
  examples: string[];
}

export interface ProductDocumentGuidance {
  productType: string;
  subcategory: string;
  requiredDocuments: DocumentRequirement[];
  optionalDocuments: DocumentRequirement[];
  generalNotes: string;
  complianceNotes: string;
}

export class ChatGPTService {
  // Cache for storing responses
  private static cache = new Map<string, ProductDocumentGuidance>();
  
  // Rate limiting
  private static lastRequestTime = 0;
  private static readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests

  static async getDocumentGuidance(
    productType: string,
    subcategory: string
  ): Promise<ProductDocumentGuidance> {
    // Check cache first
    const cacheKey = `${productType}-${subcategory}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await fetch('/api/chatgpt/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType,
          subcategory,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('API error:', error);
      // Fallback to default requirements
      return this.getDefaultGuidance(productType, subcategory);
    }
  }

  static async getGuidance(prompt: string): Promise<string> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await fetch('/api/chatgpt/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return result.response || result.message || JSON.stringify(result);
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  // Clear cache method
  static clearCache(): void {
    this.cache.clear();
  }

  // Get cache size for debugging
  static getCacheSize(): number {
    return this.cache.size;
  }

  private static getDefaultGuidance(
    productType: string,
    subcategory: string
  ): ProductDocumentGuidance {
    return {
      productType,
      subcategory,
      requiredDocuments: [
        {
          type: 'test_reports',
          label: 'Test Reports',
          required: true,
          description: 'Product safety and quality test reports',
          examples: ['CE test report', 'Safety test report']
        },
        {
          type: 'technical_docs',
          label: 'Technical Documentation',
          required: true,
          description: 'Technical specifications and user manuals for the product',
          examples: ['Technical specification', 'User manual']
        }
      ],
      optionalDocuments: [
        {
          type: 'quality_cert',
          label: 'Quality Certificates',
          required: false,
          description: 'Quality management system certificates',
          examples: ['ISO 9001', 'ISO 14001']
        },
        {
          type: 'safety_cert',
          label: 'Safety Certificates',
          required: false,
          description: 'Safety standards compliance certificates',
          examples: ['CE certificate', 'Safety document']
        }
      ],
      generalNotes: 'Basic documents are sufficient for this product. Additional documents may be required based on product characteristics.',
      complianceNotes: 'CE marking and related test reports are required for sale in Turkey.'
    };
  }
} 