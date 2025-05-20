import type { UseFormReturn } from "react-hook-form";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CompanyDocumentService } from "@/lib/services/companyDocument";
import { DocumentType } from "@/lib/types/company";
import { useEffect } from "react";

interface DocumentsStepProps {
  form: UseFormReturn<any>;
}

interface DocumentFieldProps {
  name: string;
  label: string;
  multiple?: boolean;
  required?: boolean;
}

const requiredDocuments: DocumentFieldProps[] = [
  { name: DocumentType.SIGNATURE_CIRCULAR, label: 'İmza Sirküleri', required: true },
  { name: DocumentType.TRADE_REGISTRY_GAZETTE, label: 'Ticaret Sicil Gazetesi', required: true },
  { name: DocumentType.TAX_PLATE, label: 'Vergi Levhası', required: true },
  { name: DocumentType.ACTIVITY_CERTIFICATE, label: 'Faaliyet Belgesi', required: true },
];

// Opsiyonel belgeler tamamen kaldırıldı

const DocumentField = ({ 
  form, 
  name, 
  label, 
  multiple = false, 
  required = false 
}: DocumentFieldProps & { form: UseFormReturn<any> }) => {
  const { user } = useAuth();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormLabel>{label} {required && '*'}</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple={multiple}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  // Geçici bir ID oluştur
                  const tempId = `temp_${Date.now()}`;
                  
                  // Dosyayı form state'e kaydet
                  onChange({
                    id: tempId,
                    file,
                    type: name,
                    name: file.name,
                    size: file.size,
                    status: 'pending'
                  });
                } catch (err) {
                  console.error("Dosya yükleme hatası:", err);
                  alert("Dosya yüklenemedi: " + (err instanceof Error ? err.message : "Bilinmeyen hata"));
                }
              }}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export function DocumentsStep({ form }: DocumentsStepProps) {
  useEffect(() => {
    form.register("signatureCircular", { required: "İmza Sirküleri zorunludur" });
    form.register("tradeRegistry", { required: "Ticaret Sicil Gazetesi zorunludur" });
    form.register("taxPlate", { required: "Vergi Levhası zorunludur" });
    form.register("activityCertificate", { required: "Faaliyet Belgesi zorunludur" });
  }, [form]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Zorunlu Belgeler</h3>
        {requiredDocuments.map(doc => (
          <DocumentField 
            key={doc.name} 
            form={form} 
            {...doc} 
          />
        ))}
      </div>

      {/* Opsiyonel belgeler kaldırıldı - Kullanıcılar bunları kayıt sonrası "Yeni DPC ekle" butonu ile ekleyecekler */}
    </div>
  );
}