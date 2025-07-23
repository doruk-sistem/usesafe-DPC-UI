"use client";

import { ArrowLeft, Upload, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useCompanyDocuments } from "@/lib/hooks/use-company-documents";
import { CompanyDocumentService } from "@/lib/services/companyDocument";
import { DocumentType } from "@/lib/types/company";

export default function DocumentReuploadPage() {
  const t = useTranslations('documents');
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const documentId = params.id as string;
  const { useGetCompanyDocuments } = useCompanyDocuments();
  const { data: documents, isLoading } = useGetCompanyDocuments();
  
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('signature_circular');
  const [isUploading, setIsUploading] = useState(false);

  const document = documents?.find(doc => doc.id === documentId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !document) {
      toast({
        title: t("reupload.error.title"),
        description: t("reupload.error.noFile"),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Get company ID from the original document
      const companyId = document.companyId || '';
      
      // Upload new document
      await CompanyDocumentService.uploadDocument(file, companyId, documentType);
      
      toast({
        title: t("reupload.success.title"),
        description: t("reupload.success.description"),
      });
      
      // Redirect back to documents list
      router.push("/dashboard/documents");
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: t("reupload.error.title"),
        description: error instanceof Error ? error.message : t("reupload.error.unknown"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!document) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-medium mb-2">{t('details.notFound.title')}</h2>
        <p className="text-muted-foreground mb-4">{t('details.notFound.description')}</p>
        <Button asChild>
          <Link href="/dashboard/documents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('details.backToList')}
          </Link>
        </Button>
      </div>
    );
  }

  if (document.status !== "rejected") {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-lg font-medium mb-2">{t('reupload.notRejected.title')}</h2>
        <p className="text-muted-foreground mb-4">{t('reupload.notRejected.description')}</p>
        <Button asChild>
          <Link href="/dashboard/documents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('details.backToList')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/documents/${documentId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t("reupload.title")}</h1>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t("reupload.warning")}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t("reupload.form.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="documentType">{t("reupload.form.documentType")}</Label>
            <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("reupload.form.selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="signature_circular">{t("types.signature_circular")}</SelectItem>
                <SelectItem value="trade_registry_gazette">{t("types.trade_registry_gazette")}</SelectItem>
                <SelectItem value="tax_plate">{t("types.tax_plate")}</SelectItem>
                <SelectItem value="activity_certificate">{t("types.activity_certificate")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">{t("reupload.form.file")}</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              {t("reupload.form.fileHelp")}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <Loading className="h-4 w-4 mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {t("reupload.form.upload")}
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/dashboard/documents/${documentId}`}>
                {t("reupload.form.cancel")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 