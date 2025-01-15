import { supabase } from '@/lib/supabase';
import { RegistrationRequest, RegistrationResponse } from '@/lib/data/manufacturer';
import { AddressType, DocumentStatus, DocumentType } from '@/lib/types/company';

export class ManufacturerService {
  static async register(data: RegistrationRequest): Promise<RegistrationResponse> {
    try {
      // Start a Supabase transaction
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: data.companyName,
          taxInfo: data.taxInfo,
          status: false // Pending approval
        }])
        .select()
        .single();

      if (companyError) throw new Error(companyError.message);

      // Insert company addresses
      const addresses = data.addresses.map(address => ({
        companyId: company.id,
        type: AddressType.HEADQUARTERS,
        street: address.street,
        city: address.city,
        district: address.district,
        postalCode: address.postalCode
      }));

      const { error: addressError } = await supabase
        .from('company_addresses')
        .insert(addresses);

      if (addressError) throw new Error(addressError.message);

      // Insert documents
      const documents = data.documents.map(doc => ({
        companyId: company.id,
        type: doc.type as DocumentType,
        filePath: doc.filePath,
        status: DocumentStatus.PENDING
      }));

      const { error: documentsError } = await supabase
        .from('company_documents')
        .insert(documents);

      if (documentsError) throw new Error(documentsError.message);

      return {
        success: true,
        registrationId: company.id,
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }
}