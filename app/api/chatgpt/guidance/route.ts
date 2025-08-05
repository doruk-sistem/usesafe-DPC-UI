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
  dppRequired: boolean;
  dppNotes: string;
  cbamRequired: boolean;
  cbamNotes: string;
}

export async function POST(request: NextRequest) {
  try {
    const { productType, subcategory, weight } = await request.json();

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
Determine all necessary GPSR (General Product Safety Regulation) compliance documents for the following product:

Product Type: ${productType}
Subcategory: ${subcategory}
Product Weight: ${weight ? `${weight} kg` : 'Not specified'}

Select from these specific GPSR compliance documents based on the product category and risk level:

MANDATORY DOCUMENTS (choose relevant ones):
- Declaration of Conformity
- CE Certificate/Certification
- Technical Documentation File
- Risk Assessment Report
- User Instructions and Safety Manual
- Test Reports (EN/ISO standards)
- Product Safety Assessment
- Conformity Assessment Documentation
- Manufacturing Quality Documentation
- CBAM Declaration (for CBAM covered products)
- Carbon Content Certificate (for CBAM covered products)
- Emissions Data Report (for CBAM covered products)

OPTIONAL DOCUMENTS (choose relevant ones):
- Additional Safety Testing Reports
- Environmental Impact Assessment
- Extended Durability Testing
- Quality Management System Certificate (ISO 9001)
- Post-Market Surveillance Plan
- Traceability Documentation
- Supply Chain Safety Documentation
- Incident Response Procedures
- Third Country Certificate (for CBAM imports)
- CBAM Registry Documentation (for CBAM covered products)
- Carbon Footprint Assessment (for CBAM covered products)

Analyze the specific product "${productType}" in "${subcategory}" category (${weight ? `weighing ${weight} kg` : 'weight not specified'}) and determine:
1. Which documents are mandatory vs optional based on:
   - Product risk level (consumer use, age groups, potential hazards, weight considerations)
   - CE marking requirements for this category
   - Applicable harmonized standards
   - GPSR obligations for this product type
   - Weight-specific safety requirements (heavy products may need additional handling/installation guidance)

2. Whether DPP (Digital Product Passport) is required under ESPR:
   - Check if product category falls under ESPR scope and timeline
   - DPP REQUIRED (true): Products that are mandatory NOW, in 2026, or in 2030
   - DPP NOT REQUIRED (false): Products NOT planned in ESPR timeline through 2030
   - Consider these categories for DPP requirement evaluation:
     * Textiles (2026)
     * Electronics and ICT equipment (2026)
     * Batteries (already mandatory)
     * Furniture (2027-2030)
     * Iron and steel products (2026)
     * Chemicals (2026-2030)
     * Food contact materials (2027-2030)
     * Construction products (2027-2030)

3. Whether CBAM (Carbon Border Adjustment Mechanism) compliance is required:
   - Check if product category falls under CBAM regulation scope
   - Consider product weight for carbon footprint calculations (heavier products typically have higher emissions)
   - CBAM REQUIRED (true): Products covered by CBAM sectors
   - CBAM NOT REQUIRED (false): Products NOT covered by CBAM sectors
   - CBAM covered sectors:
     * Cement and cement products
     * Iron and steel products
     * Aluminium and aluminium products
     * Fertilizers and fertilizer products
     * Electricity (for imports)
     * Hydrogen and hydrogen products
   - Weight considerations: Products over 10kg may require additional transportation impact assessments

Respond ONLY with this JSON format:

{
  "requiredDocuments": [
    {
      "type": "ce_declaration",
      "label": "CE Declaration of Conformity",
      "required": true,
      "description": "Declaration that the product meets all applicable EU requirements",
      "examples": ["CE Declaration", "Conformity Statement"]
    },
    {
      "type": "ce_certificate",
      "label": "CE Certificate/Certification",
      "required": true,
      "description": "Official CE certification document",
      "examples": ["CE Certificate", "CE Certification"]
    }
  ],
  "optionalDocuments": [
    {
      "type": "additional_testing",
      "label": "Additional Safety Testing",
      "required": false,
      "description": "Voluntary testing beyond minimum requirements",
      "examples": ["Extended safety tests", "Performance testing"]
    }
  ],
  "generalNotes": "GPSR compliance requirements for this specific product category",
  "complianceNotes": "Mandatory obligations and market surveillance considerations",
  "dppRequired": true,
  "dppNotes": "DPP will be mandatory for this product category under ESPR timeline (2026-2030)",
  "cbamRequired": true,
  "cbamNotes": "CBAM compliance required for this product category as it falls under covered sectors"
}

CRITICAL RULES:
- Select specific documents from the lists above, don't create new ones
- Focus on actual compliance documents (GPSR, CBAM, etc.)
- DPP Evaluation: Set dppRequired = true if product category is planned for ANY year through 2030
- DPP Evaluation: Set dppRequired = false ONLY if product category is NOT in ESPR plan through 2030
- CBAM Evaluation: Set cbamRequired = true if product falls under CBAM covered sectors
- CBAM Evaluation: Set cbamRequired = false if product is NOT covered by CBAM regulation
- Consider product-specific requirements for ${productType}
- Factor in product weight (${weight ? `${weight} kg` : 'not specified'}) for safety and compliance assessments
- Heavy products (>10kg) may need additional handling, installation, and transportation safety documents
- NEVER use numbers or indexes in response
- Respond ONLY with JSON object
- Use actual product type and subcategory names in descriptions
- Include GPSR documents, ESPR DPP assessment, AND CBAM compliance evaluation
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
            content: `You are a comprehensive EU compliance expert specializing in GPSR, ESPR, and CBAM regulations.

Your expertise covers:
GPSR COMPLIANCE:
- GPSR mandatory requirements for different product categories
- Risk assessment and classification of products
- Technical file requirements and documentation standards
- CE marking requirements and harmonized standards
- Market surveillance and product liability considerations
- Category-specific safety requirements (toys, electronics, textiles, chemicals, etc.)

ESPR & DPP COMPLIANCE:
- ESPR scope and product categories with specific timeline
- Digital Product Passport (DPP) requirements and mandatory dates
- DPP evaluation criteria:
  * REQUIRED (true): Currently mandatory OR planned for 2026, 2027, 2028, 2029, or 2030
  * NOT REQUIRED (false): NOT planned in ESPR timeline through 2030
- Key DPP categories: Textiles (2026), Electronics/ICT (2026), Batteries (mandatory), Furniture (2027-2030), Iron/steel (2026), Chemicals (2026-2030), Food contact materials (2027-2030), Construction products (2027-2030)
- Sustainability and ecodesign requirements

CBAM COMPLIANCE:
- CBAM covered sectors and product categories
- Carbon Border Adjustment Mechanism requirements
- CBAM evaluation criteria:
  * REQUIRED (true): Products falling under covered sectors (cement, iron/steel, aluminium, fertilizers, electricity, hydrogen)
  * NOT REQUIRED (false): Products NOT covered by CBAM regulation
- CBAM documentation requirements (declarations, carbon content certificates, emissions data)
- Third country certificate requirements for imports

Your task:
- Analyze the specific product type, subcategory, and weight provided
- Determine GPSR compliance requirements based on product risk level and weight considerations
- Evaluate ESPR DPP requirement: Set true if category is in ESPR plan (now through 2030), false if not planned
- Evaluate CBAM requirement: Set true if category is covered by CBAM sectors (cement, iron/steel, aluminium, fertilizers, electricity, hydrogen), false if not covered
- Consider weight impact: Heavy products (>10kg) may require additional safety documentation for handling, installation, and transportation
- Weight considerations for carbon footprint: Heavier products typically have higher transportation emissions
- Identify mandatory vs recommended documentation including CBAM documents for covered products
- Consider product-specific safety, sustainability, and carbon compliance standards
- Provide practical compliance guidance for EU market access

RESPONSE REQUIREMENTS:
- Respond ONLY with a JSON object, no additional text
- NEVER use numbers, indexes, or codes like "5 - 2343"
- Reference actual product names provided, not generic terms
- Include both GPSR document requirements AND ESPR DPP assessment
- Classify documents as required (mandatory) or optional (recommended)
- Provide clear true/false for dppRequired field`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: "gpt-4.1-mini",
        temperature: 0.25,
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

    // Kontrol: GPSR odaklı mı?
    if (!content.toLowerCase().includes('gpsr') && !content.toLowerCase().includes('safety')) {
      console.warn('AI response may not be focused on GPSR compliance');
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
      dppRequired: parsed.dppRequired || false,
      dppNotes: parsed.dppNotes || '',
      cbamRequired: parsed.cbamRequired || false,
      cbamNotes: parsed.cbamNotes || '',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    
    // Fallback to default GPSR requirements
    const defaultGuidance: ProductDocumentGuidance = {
      productType: 'Unknown',
      subcategory: 'Unknown',
      requiredDocuments: [
        {
          type: 'ce_declaration',
          label: 'CE Declaration of Conformity',
          required: true,
          description: 'Declaration that the product meets all applicable EU requirements and bears CE marking',
          examples: ['CE Declaration', 'EU Conformity Statement', 'Declaration of Conformity']
        },
        {
          type: 'ce_certificate',
          label: 'CE Certificate/Certification',
          required: true,
          description: 'Official CE certification document issued by notified body or self-declared',
          examples: ['CE Certificate', 'CE Certification', 'Notified Body Certificate']
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
        },
        {
          type: 'user_instructions',
          label: 'User Instructions and Safety Manual',
          required: true,
          description: 'Clear instructions for safe use, maintenance, and disposal of the product',
          examples: ['User manual', 'Safety instructions', 'Installation guide']
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
        },
        {
          type: 'surveillance_plan',
          label: 'Post-Market Surveillance Plan',
          required: false,
          description: 'Plan for monitoring product safety after market placement',
          examples: ['Market monitoring plan', 'Customer feedback system', 'Incident tracking procedures']
        }
      ],
      generalNotes: 'All products placed on EU market must comply with GPSR. CE marking is mandatory for most consumer products. Risk assessment must be proportionate to product risk level.',
      complianceNotes: 'Manufacturers must maintain technical documentation for 10 years. Economic operators must cooperate with market surveillance authorities. Serious risks must be immediately reported to authorities.',
      dppRequired: false,
      dppNotes: 'DPP requirement evaluation: Product category not included in ESPR mandatory timeline through 2030.',
      cbamRequired: false,
      cbamNotes: 'CBAM requirement evaluation: Product category not covered by Carbon Border Adjustment Mechanism.'
    };

    return NextResponse.json(defaultGuidance);
  }
} 