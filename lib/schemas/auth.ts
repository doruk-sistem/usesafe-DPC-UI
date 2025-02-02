import * as z from "zod";

// TC Kimlik validation function
function validateTCKimlik(tcno: string) {
  if (!/^[1-9]\d{10}$/.test(tcno)) {
    return false;
  }

  const digits = tcno.split('').map(Number);
  
  // Check if last digit is even
  if (digits[10] % 2 !== 0) {
    return false;
  }

  // Sum of first 10 digits
  const sum = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
  if (sum % 10 !== digits[10]) {
    return false;
  }

  // Special algorithm check for 10th digit
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  if ((oddSum * 7 - evenSum) % 10 !== digits[9]) {
    return false;
  }

  return true;
}

// Phone number validation function
function validatePhoneNumber(phone: string) {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's exactly 10 digits and doesn't start with 0
  return /^[1-9]\d{9}$/.test(cleaned);
}

export const registerSchema = z.object({
  // Company Information
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyType: z.enum(['manufacturer', 'brand_owner', 'material_supplier', 'factory'], {
    required_error: "Please select company type"
  }),
  taxId: z.string()
    .length(10, "Tax ID must be exactly 10 digits")
    .regex(/^\d+$/, "Tax ID must contain only numbers"),
  tradeRegisterNumber: z.string().optional(),
  mersisNumber: z.string().optional(),

  // Owner Information
  ownerName: z.string().min(2, "Full name must be at least 2 characters"),
  nationalId: z.string()
    .length(11, "National ID must be exactly 11 digits")
    .regex(/^[1-9]\d{10}$/, "National ID must start with 1-9 and contain only numbers")
    .refine((val) => validateTCKimlik(val), {
      message: "Invalid Turkish National ID number"
    }),
  email: z.string()
    .email("Invalid email address")
    .refine((email) => {
      // Check if it's a free email provider
      const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const domain = email.split('@')[1];
      return !freeEmailProviders.includes(domain);
    }, {
      message: "Please use a corporate email address"
    }),
  phone: z.string()
    .refine((val) => validatePhoneNumber(val), {
      message: "Phone number must be 10 digits and start with a non-zero digit"
    }),
  countryCode: z.string().default("+90"),

  // Address Information
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  postalCode: z.string().optional(),

  // Required Documents
  signatureCircular: z.any(),
  tradeRegistry: z.any(),
  taxPlate: z.any(),
  activityCertificate: z.any(),

  // Optional Documents
  isoCertificates: z.array(z.any()).optional(),
  qualityCertificates: z.array(z.any()).optional(),
  exportDocuments: z.array(z.any()).optional(),
  productionPermits: z.array(z.any()).optional(),

  // Password
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/\d/, "Password must contain at least 1 number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});