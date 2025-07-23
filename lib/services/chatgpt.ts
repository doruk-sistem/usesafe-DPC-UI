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
  dppRequired: boolean;
  dppNotes: string;
  cbamRequired: boolean;
  cbamNotes: string;
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
          type: 'ce_declaration',
          label: 'CE Declaration of Conformity',
          required: true,
          description: 'Declaration that the product meets all applicable EU requirements and bears CE marking',
          examples: ['CE Declaration', 'EU Conformity Statement', 'Declaration of Conformity']
        },
        {
          type: 'technical_documentation',
          label: 'Technical Documentation File',
          required: true,
          description: 'Complete technical file proving product design safety and compliance',
          examples: ['Technical specifications', 'Design drawings', 'Component lists']
        },
        {
          type: 'risk_assessment',
          label: 'Risk Assessment Report',
          required: true,
          description: 'Comprehensive risk analysis identifying and mitigating product hazards',
          examples: ['Safety risk assessment', 'Hazard analysis', 'Risk mitigation plan']
        }
      ],
      optionalDocuments: [
        {
          type: 'additional_testing',
          label: 'Additional Safety Testing Reports',
          required: false,
          description: 'Voluntary testing beyond minimum GPSR requirements to demonstrate enhanced safety',
          examples: ['Extended durability tests', 'Environmental stress testing', 'Performance validation']
        },
        {
          type: 'quality_certificate',
          label: 'Quality Management System Certificate',
          required: false,
          description: 'ISO 9001 or equivalent quality management certification',
          examples: ['ISO 9001 certificate', 'Quality system documentation', 'Manufacturing process validation']
        }
      ],
      generalNotes: 'All products placed on EU market must comply with GPSR. CE marking is mandatory for most consumer products. Risk assessment must be proportionate to product risk level.',
      complianceNotes: 'Manufacturers must maintain technical documentation for 10 years. Economic operators must cooperate with market surveillance authorities. Serious risks must be immediately reported to authorities.',
      dppRequired: false,
      dppNotes: 'DPP requirement evaluation: Product category not included in ESPR mandatory timeline through 2030.',
      cbamRequired: false,
      cbamNotes: 'CBAM requirement evaluation: Product category not covered by Carbon Border Adjustment Mechanism.'
    };
  }
} 