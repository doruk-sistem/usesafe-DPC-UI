export const ACCEPTED_DOCUMENT_FORMATS = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp"] as const;

export const DOCUMENT_TYPES = [
  {
    id: "test_reports",          
    label: "Test Raporları",
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  {
    id: "technical_docs", 
    label: "Teknik Dokümantasyon",
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  {
    id: "compliance_docs",  
    label: "Uygunluk Belgeleri",
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  {
    id: "quality_cert",
    label: "Kalite Sertifikaları",
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  {
    id: "safety_cert",
    label: "Güvenlik Sertifikaları",
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number]["id"];

export type RequiredDocuments = {
  [subcategoryId: string]: {
    [K in DocumentType]?: boolean;
  };
};

export const REQUIRED_DOCUMENTS: RequiredDocuments = {
  eye_protection_sunglasses: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: false,
    safety_cert: false,
  },

  EYE_PROTECTION_SUNGLASSES: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: false,
    safety_cert: false,
  },
  GOZ_KORUYUCULAR_GUNES_GOZLUKLERI: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    
  },

  personal_protective_equipment: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: false,
    safety_cert: false,
  },

  PERSONAL_PROTECTIVE_EQUIPMENT: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: false,
    safety_cert: false,
  },
  toys: {
    test_reports: true,
    technical_docs: true,
    quality_cert: true,
    compliance_docs: false,
    safety_cert: false,
  },

  TOYS: {
    test_reports: true,
    technical_docs: true,
    quality_cert: true,
    compliance_docs: false,
    safety_cert: false,
  },

  OYUNCAKLAR: {
    test_reports: true,
    technical_docs: true,
    quality_cert: true,
    compliance_docs: false,
    safety_cert: false,
  },
  cingiraklar: {
    test_reports: true,
    technical_docs: true,
    quality_cert: true,
    compliance_docs: false,
    safety_cert: false,
  },
  CINGIRAKLAR: {
    test_reports: true,
    technical_docs: true,
    quality_cert: true,
    compliance_docs: false,
    safety_cert: false,
  },
  çingıraklar: {
    test_reports: true,
    technical_docs: true,
    quality_cert: true,
    compliance_docs: false,
    safety_cert: false,
  },
  detergents: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: true,
    safety_cert: true,
  },
  footwear: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: true,
    safety_cert: true,
  },
  telecommunications_equipment: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: true,
    safety_cert: true,
  },
  cosmetics: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: true,
    safety_cert: true,
  },
  stationery: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: true,
    safety_cert: true,
  },
  food_contact_materials: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: true,
    safety_cert: true,
  },
  electrical_equipment: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: true,
    safety_cert: true,
  },
  other_consumer_products: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: true,
    safety_cert: true,
  },
  toothbrushes: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: true,
    safety_cert: true,
  },
  food: {
    test_reports: true,
    technical_docs: true,
    compliance_docs: true,
    quality_cert: true,
    safety_cert: true,
  },
};

// Her doküman tipi için konfigürasyon ayarları
export const DOCUMENT_TYPE_CONFIG = {
  test_reports: {
    label: "Test Reports",
    maxSize: 10 * 1024 * 1024, // 10MB
    required: false,
  },
  technical_docs: {
    label: "Technical Documentation",
    maxSize: 10 * 1024 * 1024,
    required: false,
  },
  compliance_docs: {
    label: "Compliance Documents",
    maxSize: 10 * 1024 * 1024,
    required: false,
  },
  quality_cert: {
    label: "Quality Certificates",
    maxSize: 10 * 1024 * 1024,
    required: false,
  },
  safety_cert: {
    label: "Safety Certificates",
    maxSize: 10 * 1024 * 1024,
    required: false,
  },
} as const;

// AI'dan gelen belge türlerini standart türlere mapping
export const AI_TO_STANDARD_MAPPING: Record<string, keyof typeof DOCUMENT_TYPE_CONFIG> = {
  "CE Declaration of Conformity": "compliance_docs",
  "CE Marking": "compliance_docs",
  "Energy Label": "compliance_docs",
  "RoHS Compliance Certificate": "compliance_docs",
  "REACH Compliance": "compliance_docs",
  "WEEE Compliance": "compliance_docs",
  "Type Approval Certificate": "quality_cert",
  "Quality Certificate": "quality_cert",
  "ISO Certificate": "quality_cert",
  "Warranty Certificate": "quality_cert",
  "Technical Data Sheet": "technical_docs",
  "Technical Documentation": "technical_docs",
  "User Manual": "technical_docs",
  "Installation Guide": "technical_docs",
  "Maintenance Manual": "technical_docs",
  "Test Reports": "test_reports",
  "Test Certificate": "test_reports",
  "Safety Certificate": "safety_cert",
  "Safety Data Sheet": "safety_cert",
  "Material Safety Data Sheet": "safety_cert",
};

// Standart türden AI türüne reverse mapping
export const STANDARD_TO_AI_MAPPING: Record<keyof typeof DOCUMENT_TYPE_CONFIG, string[]> = {
  compliance_docs: ["CE Declaration of Conformity", "CE Marking", "Energy Label", "RoHS Compliance Certificate", "REACH Compliance", "WEEE Compliance"],
  quality_cert: ["Type Approval Certificate", "Quality Certificate", "ISO Certificate", "Warranty Certificate"],
  technical_docs: ["Technical Data Sheet", "Technical Documentation", "User Manual", "Installation Guide", "Maintenance Manual"],
  test_reports: ["Test Reports", "Test Certificate"],
  safety_cert: ["Safety Certificate", "Safety Data Sheet", "Material Safety Data Sheet"],
};

// Doküman boyutu için sabitler
export const FILE_SIZE = {
  KB: 1024,
  MB: 1024 * 1024,
  MAX_SIZE: 10 * 1024 * 1024, // 10MB genel limit
} as const;

// Hata mesajları için sabitler
export const ERROR_MESSAGES = {
  INVALID_FORMAT: (formats: string[]) => 
    `Invalid file format. Accepted formats are: ${formats.join(", ")}`,
  FILE_TOO_LARGE: (maxSize: number) => 
    `File is too large. Maximum size is ${maxSize / FILE_SIZE.MB}MB`,
  REQUIRED_DOCUMENT: (docLabel: string) => 
    `${docLabel} is required for this product category`,
} as const;