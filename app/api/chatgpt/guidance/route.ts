import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const { productType, subcategory } = await request.json();

    if (!productType || !subcategory) {
      return NextResponse.json(
        { error: 'Product type and subcategory are required' },
        { status: 400 }
      );
    }

    const API_URL = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`;
    const API_KEY = process.env.AZURE_OPENAI_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Azure OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const prompt = `
Aşağıdaki ürün tipi ve alt kategorisi için Türkiye'de satış için gerekli belgeleri belirle:

Ürün Tipi: ${productType}
Alt Kategori: ${subcategory}

Lütfen aşağıdaki JSON formatında yanıt ver:

{
  "requiredDocuments": [
    {
      "type": "test_reports",
      "label": "Test Raporları",
      "required": true,
      "description": "Ürünün güvenlik ve kalite testlerini gösteren raporlar",
      "examples": ["CE test raporu", "Güvenlik test raporu"]
    }
  ],
  "optionalDocuments": [
    {
      "type": "quality_cert",
      "label": "Kalite Sertifikaları", 
      "required": false,
      "description": "Kalite yönetim sistemi sertifikaları",
      "examples": ["ISO 9001", "ISO 14001"]
    }
  ],
  "generalNotes": "Genel notlar ve öneriler",
  "complianceNotes": "Uyumluluk gereksinimleri hakkında notlar"
}

Belge tipleri:
- test_reports: Test Raporları
- technical_docs: Teknik Dokümantasyon  
- compliance_docs: Uygunluk Belgeleri
- quality_cert: Kalite Sertifikaları
- safety_cert: Güvenlik Sertifikaları

Sadece JSON formatında yanıt ver, başka açıklama ekleme.
    `;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Sen bir ürün belge gereksinimleri uzmanısın. Türkiye\'de ürün satışı için gerekli belgeleri belirlemekte uzmanlaşmışsın.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from Azure OpenAI');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const result: ProductDocumentGuidance = {
      productType,
      subcategory,
      requiredDocuments: parsed.requiredDocuments || [],
      optionalDocuments: parsed.optionalDocuments || [],
      generalNotes: parsed.generalNotes || '',
      complianceNotes: parsed.complianceNotes || '',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    
    // Fallback to default requirements
    const defaultGuidance: ProductDocumentGuidance = {
      productType: 'Unknown',
      subcategory: 'Unknown',
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

    return NextResponse.json(defaultGuidance);
  }
} 