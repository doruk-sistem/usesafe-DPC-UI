export const ACCEPTED_DOCUMENT_FORMATS = ["pdf", "doc", "docx"] as const;

export const DOCUMENT_TYPES = [
  {
    id: "test_reports",          
    label: "Test Reports",
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  {
    id: "technical_docs", 
    label: "Technical Documentation",
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  {
    id: "compliance_docs",  
    label: "Compliance Documents",
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  {
    id: "quality_cert",
    label: "Quality Certificates",
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  {
    id: "safety_cert",
    label: "Safety Certificates",
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
  }
};

// Her doküman tipi için konfigürasyon ayarları
export const DOCUMENT_TYPE_CONFIG = {
  quality_cert: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  safety_cert: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  test_reports: {
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  technical_docs: {
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
  compliance_docs: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: ACCEPTED_DOCUMENT_FORMATS,
  },
} as const;

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