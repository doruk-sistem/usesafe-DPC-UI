"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { CompanyDocumentService } from "@/lib/services/companyDocument";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DocumentType } from "@/lib/types/company";

const DOCUMENT_TYPES = [
  { id: DocumentType.SIGNATURE_CIRCULAR, label: "İmza Sirküleri" },
  { id: DocumentType.TRADE_REGISTRY_GAZETTE, label: "Ticaret Sicil Gazetesi" },
  { id: DocumentType.TAX_PLATE, label: "Vergi Levhası" },
  { id: DocumentType.ACTIVITY_CERTIFICATE, label: "Faaliyet Belgesi" }
];

export default function UploadDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !docType) {
      setError("Lütfen bir dosya ve döküman tipi seçin");
      return;
    }

    if (!user?.user_metadata?.data?.company_id) {
      setError("Şirket bilgisi bulunamadı");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await CompanyDocumentService.uploadDocument(
        file,
        user.user_metadata.data.company_id,
        docType
      );
      router.push("/dashboard/documents");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Döküman yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Döküman Yükle</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="documentType">Döküman Tipi</Label>
            <Select
              value={docType}
              onValueChange={(value) => {
                setDocType(value);
                setError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Döküman tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Dosya</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <p className="text-sm text-gray-500">
              Desteklenen formatlar: PDF, DOC, DOCX, JPG, JPEG, PNG
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isUploading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Yükleniyor..." : "Yükle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 