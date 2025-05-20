import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DocumentType } from "@/lib/types/company";

interface DocumentsStepProps {
  form: UseFormReturn<any>;
}

export function DocumentsStep({ form }: DocumentsStepProps) {
  const handleFileChange = (field: string, file: File | null) => {
    if (file) {
      form.setValue(field, { file, type: field as DocumentType });
    } else {
      form.setValue(field, null);
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="signatureCircular"
        render={({ field }) => (
          <FormItem>
            <FormLabel>İmza Sirküleri</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileChange("signatureCircular", file);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tradeRegistry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ticaret Sicil Gazetesi</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileChange("tradeRegistry", file);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="taxPlate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vergi Levhası</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileChange("taxPlate", file);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="activityCertificate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Faaliyet Belgesi</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileChange("activityCertificate", file);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}