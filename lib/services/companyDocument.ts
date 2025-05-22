import { supabase } from "@/lib/supabase/client";
import { Document } from "@/lib/types/document";
import { DocumentType } from "@/lib/types/company";

export class CompanyDocumentService {
  static readonly BUCKET = "company-documents";

  static async uploadDocument(
    file: File,
    companyId: string,
    type: DocumentType
  ): Promise<{ filePath: string; publicUrl: string | null }> {
    try {
      // Dosya tipini kontrol et
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        throw new Error('Sadece PDF ve resim dosyaları yüklenebilir');
      }

      // Dosya boyutunu kontrol et (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Dosya boyutu 10MB\'dan büyük olamaz');
      }

      // Dosya adını güvenli hale getir
      const safeFileName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_');

      // Dosya yolunu oluştur
      const filePath = `${companyId}/${type}/${Date.now()}_${safeFileName}`;

      // Dosyayı Supabase Storage'a yükle
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        throw new Error(`Dosya yüklenirken hata oluştu: ${uploadError.message}`);
      }

      // Dosyanın public URL'ini al
      const { data: { publicUrl } } = supabase.storage
        .from('company-documents')
        .getPublicUrl(filePath);

      // Veritabanına kaydet
      const { data: documentData, error: insertError } = await supabase
        .from('company_documents')
        .insert({
          companyId: companyId,
          type: type,
          filePath: filePath,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Veritabanına kaydedilirken hata oluştu: ${insertError.message}`);
      }

      return { filePath, publicUrl: publicUrl || null };
    } catch (error) {
      throw error;
    }
  }

  static async getCompanyDocuments(companyId: string): Promise<Document[]> {
    try {
      // Supabase bağlantısını kontrol et
      if (!supabase) {
        throw new Error("Supabase bağlantısı başlatılamadı");
      }

      const { data: documents, error } = await supabase
        .from("company_documents")
        .select("*")
        .eq("companyId", companyId);

      if (error) {
        throw new Error(`Veritabanı hatası: ${error.message}`);
      }

      if (!documents) {
        return [];
      }

      const mappedDocuments = documents.map((doc: any) => ({
        id: doc.id,
        name: doc.filePath?.split('/').pop() || "Unnamed Document",
        type: doc.type,
        category: doc.type,
        url: doc.filePath || "",
        filePath: doc.filePath || "",
        status: (doc.status || "pending").toLowerCase(),
        fileSize: "",
        version: "1.0",
        validUntil: undefined,
        rejection_reason: doc.rejectionReason || undefined,
        created_at: doc.createdAt || new Date().toISOString(),
        updated_at: doc.updatedAt || new Date().toISOString(),
        uploadedAt: doc.createdAt || new Date().toISOString(),
        size: 0,
        notes: ""
      }));

      return mappedDocuments;
    } catch (error) {
      throw error;
    }
  }

  static async updateDocumentStatus(
    documentId: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('company_documents')
        .update({
          status,
          rejectionReason,
          updatedAt: new Date().toISOString()
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw new Error(`Döküman durumu güncellenirken hata oluştu: ${error.message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  static async getPublicUrl(filePath: string): Promise<string> {
    const { data: { publicUrl } } = supabase.storage
      .from("company-documents")
      .getPublicUrl(filePath);

    return publicUrl;
  }
}