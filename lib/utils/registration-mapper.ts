import type { z } from "zod";

import type { RegistrationRequest } from "@/lib/data/manufacturer";
import { registerSchema } from "@/lib/schemas/auth";
import { formatPhoneNumber } from "@/lib/utils/form";

import { CompanyType } from "../types/company";

type FormData = z.infer<typeof registerSchema>;

export const prepareRegistrationData = (
  data: FormData
): RegistrationRequest => {
  return {
    companyName: data.companyName,
    companyType: CompanyType.MANUFACTURER,
    password: data.password,
    taxInfo: {
      taxNumber: data.taxId,
      tradeRegistryNo: data.tradeRegisterNumber || undefined,
      mersisNo: data.mersisNumber || undefined,
    },
    authorizedPerson: {
      fullName: data.ownerName,
      identificationNumber: data.nationalId,
      phoneNumber: formatPhoneNumber(data.phone, data.countryCode),
      countryCode: data.countryCode,
    },
    addresses: [
      {
        type: "headquarters",
        street: data.address,
        city: data.city,
        district: data.district,
        postalCode: data.postalCode || undefined,
      },
    ],
    documents: [
      {
        type: "signature_circular",
        filePath: data.signatureCircular || "",
        metadata: { isRegistrationDocument: true }
      },
      {
        type: "trade_registry_gazette",
        filePath: data.tradeRegistry || "",
        metadata: { isRegistrationDocument: true }
      },
      {
        type: "tax_plate",
        filePath: data.taxPlate || "",
        metadata: { isRegistrationDocument: true }
      },
      {
        type: "activity_certificate",
        filePath: data.activityCertificate || "",
        metadata: { isRegistrationDocument: true }
      },
      // Opsiyonel belgeler kaldırıldı - Kullanıcılar bunları kayıt sonrası "Yeni DPC ekle" butonu ile ekleyecekler
    ],
  };
};
