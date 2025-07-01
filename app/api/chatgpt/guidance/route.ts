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
Determine all necessary documents for sales in Turkey for the following product type and subcategory:

Product Type: ${productType}
Subcategory: ${subcategory}

IMPORTANT: Use the actual product type "${productType}" and subcategory "${subcategory}" names in your descriptions. Do not use any numbers or codes.

Which documents are required and which are optional for this product? Please respond in the following JSON format:

{
  "requiredDocuments": [
    {
      "type": "your_determined_type",
      "label": "Document English Name",
      "required": true,
      "description": "Description of what this document is and why it's required",
      "examples": ["Example document names"]
    }
  ],
  "optionalDocuments": [
    {
      "type": "your_determined_type",
      "label": "Document English Name", 
      "required": false,
      "description": "Description of what this document is and why it's beneficial",
      "examples": ["Example document names"]
    }
  ],
  "generalNotes": "General document requirements and recommendations for this product",
  "complianceNotes": "Documents required for compliance with Turkish regulations and ESPR scope"
}

CRITICAL RULES:
- NEVER use numbers, indexes, or expressions like "5 - 2343" or "2 - 49" anywhere in your response
- NEVER include any numbering, bullet points, or lists outside the JSON
- NEVER add any text before or after the JSON
- Respond ONLY with the JSON object, nothing else
- Do not include any explanations, titles, or additional text
- The response must start with { and end with }
- Use the actual product type and subcategory names in your descriptions, not numbers
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
            content: `You are a product document requirements expert. You are specialized in determining all necessary documents for product sales in Turkey.

Your task:
- Determine required documents based on product type and category
- Consider ESPR (Ecodesign for Sustainable Products Regulation) scope
- Evaluate compliance requirements for Turkish regulations
- Provide clear and understandable document guidance to users
- Determine document types completely on your own, don't use any examples
- Always use the actual product type and subcategory names provided, never use numbers or codes

CRITICAL RESPONSE RULES:
- Respond ONLY with a JSON object, nothing else
- NEVER use numbers, indexes, or expressions like "5 - 2343" or "2 - 49"
- NEVER include any text before or after the JSON
- NEVER add titles, explanations, or additional formatting
- The response must start with { and end with }
- Use English for document types and labels
- Specify both required and optional documents
- Always reference the actual product type and subcategory names in descriptions`
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

    // Sıkı kontrol: Yanıtta index/sıra numarası var mı?
    if (/\d+\s*-\s*\d+/.test(content)) {
      throw new Error('Response contains sequence numbers or indexes.');
    }

    // Ekstra kontrol: JSON dışında metin var mı?
    const cleanContent = content.trim();
    if (!cleanContent.startsWith('{') || !cleanContent.endsWith('}')) {
      throw new Error('Response contains text outside JSON format.');
    }

    // Kontrol: AI category isimlerini kullanıyor mu?
    if (!content.includes(productType) && !content.includes(subcategory)) {
      console.warn('AI response does not reference the provided product type or subcategory names');
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

    return NextResponse.json(defaultGuidance);
  }
} 