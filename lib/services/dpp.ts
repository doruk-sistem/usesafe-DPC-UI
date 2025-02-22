import QRCode from "qrcode";

import { supabase } from "@/lib/supabase/client";
import type { DPP, DPPListItem, NewDPP } from "@/lib/types/dpp";

export class DPPService {
  static async generateQRCode(serialNumber: string): Promise<string> {
    try {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${serialNumber}`;
      return await QRCode.toDataURL(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw error;
    }
  }

  static async createDPP(data: NewDPP): Promise<DPP> {
    try {
      // Get template ID based on product type
      const { data: product } = await supabase
        .from("products")
        .select("product_type")
        .eq("id", data.product_id)
        .single();

      if (!product) throw new Error("Product not found");

      const { data: template } = await supabase
        .from("dpp_templates")
        .select("id")
        .eq("product_type", product.product_type)
        .single();

      if (!template) throw new Error("No template found for this product type");

      const qrCode = await this.generateQRCode(data.serial_number);

      const { data: dpp, error } = await supabase
        .from("dpps")
        .insert([
          {
            ...data,
            qr_code: qrCode,
            template_id: template.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return dpp;
    } catch (error) {
      console.error("Error creating DPP:", error);
      throw error;
    }
  }

  static async getDPPs(companyId: string): Promise<DPPListItem[]> {
    const { data, error } = await supabase
      .from("dpps")
      .select(
        `
        *,
        products (
          name,
          product_type,
          company_id
        )
      `
      )
      .eq("products.company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((dpp) => ({
      ...dpp,
      product_name: dpp.products.name,
      product_type: dpp.products.product_type,
      company_id: dpp.products.company_id,
    }));
  }

  static async getDPP(id: string): Promise<DPP | null> {
    const { data, error } = await supabase
      .from("dpps")
      .select(
        `
        *,
        products (*),
        dpp_templates (*)
      `
      )
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  }

  static async getDPPBySerialNumber(serialNumber: string): Promise<DPP | null> {
    const { data, error } = await supabase
      .from("dpps")
      .select(
        `
        *,
        products (*),
        dpp_templates (*)
      `
      )
      .eq("serial_number", serialNumber)
      .single();

    if (error) return null;
    return data;
  }
}
