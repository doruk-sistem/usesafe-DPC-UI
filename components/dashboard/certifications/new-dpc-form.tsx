"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

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
    required_error: "Lütfen bir sertifika tipi seçin",
  }),
  file: z.instanceof(File, {
    message: "Lütfen bir sertifika dosyası seçin",
  }),
});

export function NewDPCForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, company } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const companyId = user?.user_metadata?.company_id || company?.id;
      
      if (!companyId) {
        throw new Error("Şirket bilgisi bulunamadı");
      }

      // Dosyayı yükle
      const file = values.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/${values.type}_${Date.now()}.${fileExt}`;
      
      const publicUrl = await StorageHelper.uploadFile(file, {
        bucketName: 'company-documents'
      }, fileName);

      if (!publicUrl) {
        throw new Error('Sertifika dosyası yüklenemedi');
      }

      // Sertifika kaydı oluştur
      await certificationService.createCertification({
        type: values.type,
        companyId,
        filePath: fileName // filePath yerine documentPath kullanıyoruz
      });
      
      toast({
        title: "Başarılı!",
        description: "Dijital Ürün Sertifikası başvurunuz alındı.",
      });
      
      router.push("/dashboard/certifications");
    } catch (error) {
      console.error("Error creating certification:", error);
      toast({
        title: "Hata!",
        description: error instanceof Error ? error.message : "Sertifika başvurusu oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/certifications">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Dijital Ürün Sertifikası Başvurusu</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sertifika Tipi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sertifika tipini seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="iso_certificate">ISO Sertifikası</SelectItem>
                    <SelectItem value="quality_certificate">Kalite Sertifikası</SelectItem>
                    <SelectItem value="export_certificate">İhracat Belgesi</SelectItem>
                    <SelectItem value="production_permit">Üretim İzni</SelectItem>
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
                <FormLabel>Sertifika Dosyası</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                            setSelectedFileName(file.name);
                          }
                        }}
                        {...field}
                        value={undefined}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex-1 cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {selectedFileName || "Sertifika dosyasını seçmek için tıklayın"}
                          </span>
                        </div>
                      </label>
                    </div>
                    {selectedFileName && (
                      <p className="text-sm text-muted-foreground">
                        Seçilen sertifika: {selectedFileName}
                      </p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Başvuru Gönderiliyor..." : "Sertifika Başvurusunu Gönder"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
