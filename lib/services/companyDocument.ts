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
      console.log('Uploading document:', {
        fileName: file.name,
        companyId,
        type
      });

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
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Dosya yüklenirken hata oluştu: ${uploadError.message}`);
      }

      // Dosyanın public URL'ini al
      const { data: { publicUrl } } = supabase.storage
        .from('company-documents')
        .getPublicUrl(filePath);

      console.log('File uploaded successfully:', publicUrl);

      // Veritabanına kaydet
      const { data: documentData, error: insertError } = await supabase
        .from('company_documents')
        .insert({
          companyId: companyId,
          type: type,
          filePath: filePath,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Veritabanına kaydedilirken hata oluştu: ${insertError.message}`);
      }

      console.log('Document saved to database:', documentData);
      return { filePath, publicUrl: publicUrl || null };
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  static async getCompanyDocuments(companyId: string): Promise<Document[]> {
    try {
      console.log("=== SUPABASE DEBUG ===");
      console.log("Company ID:", companyId);
      console.log("Supabase client:", !!supabase);

      // Supabase bağlantısını kontrol et
      if (!supabase) {
        throw new Error("Supabase bağlantısı başlatılamadı");
      }

      console.log("Executing Supabase query for company_documents...");
      const { data: documents, error } = await supabase
        .from("company_documents")
        .select("*")
        .eq("companyId", companyId);

      console.log("Query result:", {
        hasData: !!documents,
        dataLength: documents?.length,
        error: error ? error.message : null
      });

      if (error) {
        console.error("Supabase query error:", error);
        throw new Error(`Veritabanı hatası: ${error.message}`);
      }

      if (!documents) {
        console.log("No documents found in response");
        return [];
      }

      console.log("Raw documents:", documents);
      console.log("===================");

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
      console.error("Error in getCompanyDocuments:", error);
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
        console.error('Error updating document status:', error);
        throw new Error(`Döküman durumu güncellenirken hata oluştu: ${error.message}`);
      }

      console.log('Document status updated successfully');
    } catch (error) {
      console.error('Error in updateDocumentStatus:', error);
      throw error;
    }
  }
}