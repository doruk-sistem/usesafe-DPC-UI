import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CompanyDocumentService } from "@/lib/services/companyDocument";
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
  { name: 'signatureCircular', label: 'Signature Circular', required: true },
  { name: 'tradeRegistry', label: 'Trade Registry Gazette', required: true },
  { name: 'taxPlate', label: 'Tax Plate', required: true },
  { name: 'activityCertificate', label: 'Activity Certificate', required: true },
];

const optionalDocuments: DocumentFieldProps[] = [
  { name: 'isoCertificates', label: 'ISO Certificates', multiple: true },
  { name: 'qualityCertificates', label: 'Quality Certificates', multiple: true },
  { name: 'exportDocuments', label: 'Export Documents', multiple: true },
  { name: 'productionPermits', label: 'Production Permits', multiple: true },
];

const DocumentField = ({ 
  form, 
  name, 
  label, 
  multiple = false, 
  required = false 
}: DocumentFieldProps & { form: UseFormReturn<any> }) => (
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
              // Varsayalım companyId formdan veya context'ten geliyor
              const companyId = form.getValues("companyId");
              try {
                const { filePath, publicUrl } = await CompanyDocumentService.uploadDocument(file, companyId, name);                onChange(filePath); // filePath'i form state'e kaydet
              } catch (err) {
                alert("Dosya yüklenemedi: " + err.message);
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

export function DocumentsStep({ form }: DocumentsStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Required Documents</h3>
        {requiredDocuments.map(doc => (
          <DocumentField 
            key={doc.name} 
            form={form} 
            {...doc} 
          />
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Optional Documents</h3>
        {optionalDocuments.map(doc => (
          <DocumentField 
            key={doc.name} 
            form={form} 
            {...doc} 
          />
        ))}
      </div>
    </div>
  );
}