import {
  RegistrationRequest,
  RegistrationResponse,
} from "@/lib/data/manufacturer";
import { supabase } from "@/lib/supabase/client";
import { DocumentType } from "@/lib/types/company";
import { DocumentStatus } from "@/lib/types/document";

export class ManufacturerService {
  static async register(
    data: RegistrationRequest
  ): Promise<RegistrationResponse> {
    try {
      // Start a Supabase transaction
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert([
          {
            name: data.companyName,
            companyType: data.companyType,
            taxInfo: data.taxInfo,
            status: false, // Pending approval
          },
        ])
        .select()
        .single();

      if (companyError) throw new Error(companyError.message);

      // Insert company addresses
      const addresses = data.addresses.map((address) => ({
        companyId: company.id,
        type: "headquarters",
        street: address.street,
        city: address.city,
        district: address.district,
        postalCode: address.postalCode,
      }));

      const { error: addressError } = await supabase
        .from("company_addresses")
        .insert(addresses);

      if (addressError) throw new Error(addressError.message);

      // Remove direct document insert here!
      // Documents will be uploaded after registration is complete.

      return {
        success: true,
        registrationId: company.id,
        message: "Registration successful",
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  }
}
