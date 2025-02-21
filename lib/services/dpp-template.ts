import { supabase } from "@/lib/supabase/client";
import type { DPPTemplate, NewDPPTemplate } from "@/lib/types/dpp";

export class DPPTemplateService {
  static async getTemplates(): Promise<DPPTemplate[]> {
    const { data, error } = await supabase
      .from("dpp_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getTemplate(id: string): Promise<DPPTemplate | null> {
    const { data, error } = await supabase
      .from("dpp_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  }

  static async createTemplate(template: NewDPPTemplate): Promise<DPPTemplate> {
    const { data, error } = await supabase
      .from("dpp_templates")
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTemplate(
    id: string,
    template: Partial<DPPTemplate>
  ): Promise<DPPTemplate> {
    const { data, error } = await supabase
      .from("dpp_templates")
      .update(template)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from("dpp_templates")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
