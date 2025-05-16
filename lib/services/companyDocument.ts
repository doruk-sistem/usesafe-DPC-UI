import { supabase } from "@/lib/supabase/client";

export class CompanyDocumentService {
  static readonly BUCKET = "company-documents";

  static async uploadDocument(
    file: File,
    companyId: string,
    docType: string
  ): Promise<{ filePath: string; publicUrl: string | null }> {
    // Dosya adını güvenli hale getir
    const sanitizedName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-zA-Z0-9.-]/g, "_"); // Replace special chars with underscore
    const filePath = `${companyId}/${docType}/${Date.now()}-${sanitizedName}`;


    const { error } = await supabase.storage
      .from(this.BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(this.BUCKET).getPublicUrl(filePath);
    return { filePath, publicUrl: data?.publicUrl || null };
  }
}