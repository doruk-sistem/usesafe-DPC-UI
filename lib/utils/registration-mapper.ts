import type { z } from "zod";

import type { RegistrationRequest } from "@/lib/data/manufacturer";
import { registerSchema } from "@/lib/schemas/auth";
import { formatPhoneNumber } from "@/lib/utils/form";

type FormData = z.infer<typeof registerSchema>;

export const prepareRegistrationData = (data: FormData): RegistrationRequest => {
  
  return {
    companyName: data.companyName,
    companyType: data.companyType,
    password: data.password,
    taxInfo: {
      taxNumber: data.taxId,
      tradeRegistryNo: data.tradeRegisterNumber || undefined,
      mersisNo: data.mersisNumber || undefined,
    },
    authorizedPerson: {
      fullName: data.ownerName,
      identificationNumber: data.nationalId,
      email: data.email,
      phoneNumber: formatPhoneNumber(data.phone, data.countryCode),
      countryCode: data.countryCode,
    },
    addresses: [
      {
        type: 'headquarters',
        street: data.address,
        city: data.city,
        district: data.district,
        postalCode: data.postalCode || undefined,
      },
    ],
    documents: [
      {
        type: 'signature_circular',
        filePath: data.signatureCircular || '',
      },
      {
        type: 'trade_registry_gazette',
        filePath: data.tradeRegistry || '',
      },
      {
        type: 'tax_plate',
        filePath: data.taxPlate || '',
      },
      {
        type: 'activity_certificate',
        filePath: data.activityCertificate || '',
      },
      ...(data.isoCertificates || []).map(file => ({
        type: 'iso_certificate',
        filePath: file || '',
      })),
      ...(data.qualityCertificates || []).map(file => ({
        type: 'quality_certificate',
        filePath: file || '',
      })),
      ...(data.exportDocuments || []).map(file => ({
        type: 'export_certificate',
        filePath: file || '',
      })),
      ...(data.productionPermits || []).map(file => ({
        type: 'production_permit',
        filePath: file || '',
      })),
    ],
  };
}; 