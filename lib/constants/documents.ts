export const DOCUMENT_TYPES = [
  { id: "quality_cert", label: "Quality Certificates" },
  { id: "safety_cert", label: "Safety Certificates" },
  { id: "test_reports", label: "Test Reports" },
  { id: "technical_docs", label: "Technical Documentation" },
  { id: "compliance_docs", label: "Compliance Documents" },
] as const;

export const ACCEPTED_DOCUMENT_FORMATS = ".pdf,.doc,.docx,.xls,.xlsx";

export const DOCUMENT_TYPE_CONFIG = {
  quality_cert: {
    maxSize: 10 * 1024 * 1024, // 10MB
    required: false,
    allowMultiple: true,
  },
  safety_cert: {
    maxSize: 10 * 1024 * 1024,
    required: false,
    allowMultiple: true,
  },
  test_reports: {
    maxSize: 15 * 1024 * 1024, // 15MB
    required: false,
    allowMultiple: true,
  },
  technical_docs: {
    maxSize: 20 * 1024 * 1024, // 20MB
    required: false,
    allowMultiple: true,
  },
  compliance_docs: {
    maxSize: 10 * 1024 * 1024,
    required: false,
    allowMultiple: true,
  },
} as const;