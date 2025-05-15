"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { certificationService } from "@/lib/services/certification";
import { StorageHelper } from "@/lib/utils/storage";
const formSchema = z.object({
  type: z.string({
    required_error: "Lütfen bir DPC tipi seçin",
  }),
  file: z.instanceof(File, {
    message: "Lütfen bir dosya seçin",
  }),
});

export function NewDPCForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, company } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const companyId = user?.user_metadata?.company_id || company?.id;
      
      if (!companyId) {
        throw new Error("Company ID not found");
      }

      // Dosyayı yükle
      const file = values.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/${values.type}_${Date.now()}.${fileExt}`;
      
      const publicUrl = await StorageHelper.uploadFile(file, {
        bucketName: 'company-documents'
      }, fileName);

      if (!publicUrl) {
        throw new Error('Dosya yüklenemedi');
      }

      // Sertifika kaydı oluştur
      // Sertifika kaydı oluştur
      await certificationService.createCertification({
        type: values.type,
        companyId,
        filePath: fileName // publicUrl yerine fileName kullanıyoruz çünkü veritabanında storage path'i tutuyoruz
      });
      
      toast({
        title: "Başarılı!",
        description: "DPC başvurunuz başarıyla oluşturuldu.",
      });
      
      router.push("/dashboard/certifications");
    } catch (error) {
      console.error("Error creating certification:", error);
      toast({
        title: "Hata!",
        description: error instanceof Error ? error.message : "DPC başvurusu oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Belge Tipi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Belge tipini seçin"
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="signature_circle">
                    İmza Dairesi
                  </SelectItem>
                  <SelectItem value="trade_registry_gazette">
                    Ticaret Kayıt Gazetesi
                  </SelectItem>
                  <SelectItem value="tax_plate">
                    Vergi Plakası
                  </SelectItem>
                  <SelectItem value="activity_certificate">
                    Faaliyet Sertifikası
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Belge</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  {...field}
                  value={undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Başvuruyu Gönder</Button>
      </form>
    </Form>
  );
}
