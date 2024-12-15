import { supabase } from '@/lib/supabase';
import type { DPP, DPPTemplate } from '@/lib/types/database';
import QRCode from 'qrcode';

export class DPPService {
  static async generateQRCode(serialNumber: string): Promise<string> {
    try {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${serialNumber}`;
      return await QRCode.toDataURL(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  static async createDPP(data: Partial<DPP>): Promise<DPP> {
    try {
      const qrCode = await this.generateQRCode(data.serial_number!);
      
      const { data: dpp, error } = await supabase
        .from('dpps')
        .insert([{ ...data, qr_code: qrCode }])
        .select()
        .single();

      if (error) throw error;
      return dpp;
    } catch (error) {
      console.error('Error creating DPP:', error);
      throw error;
    }
  }

  static async getDPPTemplate(productTypeId: number): Promise<DPPTemplate> {
    const { data, error } = await supabase
      .from('dpp_templates')
      .select('*')
      .eq('product_type_id', productTypeId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getDPPBySerialNumber(serialNumber: string): Promise<DPP | null> {
    const { data, error } = await supabase
      .from('dpps')
      .select(`
        *,
        product:products(*),
        template:dpp_templates(*)
      `)
      .eq('serial_number', serialNumber)
      .single();

    if (error) return null;
    return data;
  }
}