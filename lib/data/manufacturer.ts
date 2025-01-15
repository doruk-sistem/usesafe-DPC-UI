export interface RegistrationRequest {
  // Company Information
  companyName: string;
  password: string;
  taxInfo: {
    taxNumber: string;
    tradeRegistryNo?: string;
    mersisNo?: string;
  };
  authorizedPerson: {
    fullName: string;
    identificationNumber: string;
    email: string;
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
    type: string;
    filePath: string;
  }[];
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  registrationId?: string;
} 