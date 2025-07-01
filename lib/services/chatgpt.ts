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
          label: 'Test Raporları',
          required: true,
          description: 'Ürünün güvenlik ve kalite testlerini gösteren raporlar',
          examples: ['CE test raporu', 'Güvenlik test raporu']
        },
        {
          type: 'technical_docs',
          label: 'Teknik Dokümantasyon',
          required: true,
          description: 'Ürünün teknik özelliklerini ve kullanım talimatlarını içeren dokümanlar',
          examples: ['Teknik şartname', 'Kullanım kılavuzu']
        }
      ],
      optionalDocuments: [
        {
          type: 'quality_cert',
          label: 'Kalite Sertifikaları',
          required: false,
          description: 'Kalite yönetim sistemi sertifikaları',
          examples: ['ISO 9001', 'ISO 14001']
        },
        {
          type: 'safety_cert',
          label: 'Güvenlik Sertifikaları',
          required: false,
          description: 'Güvenlik standartlarına uygunluk sertifikaları',
          examples: ['CE sertifikası', 'Güvenlik belgesi']
        }
      ],
      generalNotes: 'Bu ürün için temel belgeler yeterlidir. Ek belgeler ürünün özelliklerine göre gerekebilir.',
      complianceNotes: 'Türkiye\'de satış için CE işareti ve ilgili test raporları gereklidir.'
    };
  }
} 