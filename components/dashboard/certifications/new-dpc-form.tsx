"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

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

export function NewDPCForm() {
  const t = useTranslations('certifications');
  const router = useRouter();
  const { toast } = useToast();
  const { user, company } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const formSchema = z.object({
    type: z.string({
      required_error: t('form.validation.type.required'),
    }),
    file: z.instanceof(File, {
      message: t('form.validation.file.required'),
    }),
  });

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
        throw new Error(t('form.errors.companyNotFound'));
      }

      // Dosyayı yükle
      const file = values.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/${values.type}_${Date.now()}.${fileExt}`;
      
      const publicUrl = await StorageHelper.uploadFile(file, {
        bucketName: 'company-documents'
      }, fileName);

      if (!publicUrl) {
        throw new Error(t('form.errors.uploadFailed'));
      }

      // Sertifika kaydı oluştur
      await certificationService.createCertification({
        type: values.type,
        companyId,
        filePath: fileName
      });
      
      toast({
        title: t('form.success.title'),
        description: t('form.success.description'),
      });
      
      router.push("/dashboard/certifications");
    } catch (error) {
      console.error("Error creating certification:", error);
      toast({
        title: t('form.errors.title'),
        description: error instanceof Error ? error.message : t('form.errors.generic'),
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
        <h1 className="text-2xl font-bold">{t('form.title')}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.fields.type.label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.fields.type.placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="iso_certificate">{t('types.iso')}</SelectItem>
                    <SelectItem value="quality_certificate">{t('types.quality')}</SelectItem>
                    <SelectItem value="export_certificate">{t('types.export')}</SelectItem>
                    <SelectItem value="production_permit">{t('types.production')}</SelectItem>
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
                <FormLabel>{t('form.fields.file.label')}</FormLabel>
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
                            {selectedFileName || t('form.fields.file.placeholder')}
                          </span>
                        </div>
                      </label>
                    </div>
                    {selectedFileName && (
                      <p className="text-sm text-muted-foreground">
                        {t('form.fields.file.selected', { name: selectedFileName })}
                      </p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('form.submit.loading') : t('form.submit.default')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
