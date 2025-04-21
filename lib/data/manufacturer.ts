import { CompanyType, DocumentType } from "../types/company";

export interface RegistrationRequest {
  // Company Information
  companyName: string;
  companyType: CompanyType;
  password: string;
  taxInfo: {
    taxNumber: string;
    tradeRegistryNo?: string;
    mersisNo?: string;
  };
  authorizedPerson: {
    fullName: string;
    identificationNumber: string;
    phoneNumber: string;
    countryCode: string;
  };
  addresses: {
    type: 'headquarters';
    street: string;
    city: string;
    district: string;
    postalCode?: string;
  }[];
  documents: {
    type: DocumentType;
    filePath: string;
  }[];
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  registrationId?: string;
} 