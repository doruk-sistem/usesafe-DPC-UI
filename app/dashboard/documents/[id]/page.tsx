"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, Download } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusIcon } from "@/lib/utils/document-utils";
import { useCompanyDocuments } from "@/lib/hooks/use-company-documents";
import { Loading } from "@/components/ui/loading";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function DocumentDetailsPage() {
  const t = useTranslations('documents');
  const params = useParams();
  const documentId = params.id as string;
  const { useGetCompanyDocuments } = useCompanyDocuments();
  const { data: documents, isLoading } = useGetCompanyDocuments();

  const document = documents?.find(doc => doc.id === documentId);

  const handleViewFile = () => {
    console.log("handleViewFile called", { filePath: document?.filePath, SUPABASE_URL });
    if (document?.filePath && SUPABASE_URL) {
      const url = `${SUPABASE_URL}/storage/v1/object/public/company-documents/${document.filePath}`;
      console.log("Opening URL:", url);
      window.open(url, '_blank');
    } else {
      console.log("Eksik bilgi: filePath veya SUPABASE_URL yok");
    }
  };

  const handleDownloadFile = () => {
    console.log("handleDownloadFile called", { filePath: document?.filePath, SUPABASE_URL });
    if (document?.filePath && SUPABASE_URL) {
      const url = `${SUPABASE_URL}/storage/v1/object/public/company-documents/${document.filePath}`;
      console.log("Opening URL:", url);
      window.open(url, '_blank');
    } else {
      console.log("Eksik bilgi: filePath veya SUPABASE_URL yok");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!document) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-medium mb-2">{t('details.notFound')}</h2>
        <p className="text-muted-foreground mb-4">{t('details.notFoundDescription')}</p>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/documents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('details.backToList')}
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{document.name}</h1>
          <p className="text-sm text-muted-foreground">
            {document.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleDownloadFile} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('details.downloadFile')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('details.information')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t('details.type')}</dt>
                <dd className="mt-1">{t(`types.${document.type}`)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t('details.fileSize')}</dt>
                <dd className="mt-1">{document.fileSize}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t('details.createdAt')}</dt>
                <dd className="mt-1">{document.created_at ? new Date(document.created_at).toLocaleDateString() : 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t('details.updatedAt')}</dt>
                <dd className="mt-1">{document.updated_at ? new Date(document.updated_at).toLocaleDateString() : 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {document.notes && (
          <Card>
            <CardHeader>
              <CardTitle>{t('details.notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{document.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 