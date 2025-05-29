"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { CompanyDocumentService } from "@/lib/services/companyDocument";
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
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { DocumentType } from "@/lib/types/company";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const DOCUMENT_TYPES = [
  { id: DocumentType.SIGNATURE_CIRCULAR, label: "İmza Sirküleri" },
  { id: DocumentType.TRADE_REGISTRY_GAZETTE, label: "Ticaret Sicil Gazetesi" },
  { id: DocumentType.TAX_PLATE, label: "Vergi Levhası" },
  { id: DocumentType.ACTIVITY_CERTIFICATE, label: "Faaliyet Belgesi" }
];

const formSchema = z.object({
  type: z.nativeEnum(DocumentType, { errorMap: () => ({ message: "Döküman tipi seçin" }) }),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const t = useTranslations("documents.upload");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: undefined as unknown as DocumentType },
  });

  async function onSubmit(values: FormValues) {
    setFileError("");
    if (!file) {
      setFileError("Dosya seçin");
      return;
    }
    if (!user?.user_metadata?.data?.company_id) {
      form.setError("type", { message: "Şirket bilgisi bulunamadı" });
      return;
    }
    setIsUploading(true);
    try {
      await CompanyDocumentService.uploadDocument(
        file,
        user.user_metadata.data.company_id,
        values.type
      );
      router.push("/dashboard/documents");
      router.refresh();
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Döküman yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="py-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/documents">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("typeLabel")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("typePlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>{t("fileLabel")}</FormLabel>
                <div className="flex flex-col gap-4">
                  <Input
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setFile(f || null);
                      setSelectedFileName(f ? f.name : "");
                      setFileError("");
                    }}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-gray-400"
                  >
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <span>{selectedFileName || t("filePlaceholder")}</span>
                  </label>
                  {fileError && <p className="text-sm text-red-500 mt-2">{fileError}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? "Yükleniyor..." : t("submit")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 