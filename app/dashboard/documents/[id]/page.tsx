"use client";

import { ArrowLeft, Eye, Download } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useCompanyDocuments } from "@/lib/hooks/use-company-documents";
import { CompanyDocumentService } from "@/lib/services/companyDocument";
import { getStatusIcon } from "@/lib/utils/document-utils";

export default function DocumentDetailsPage() {
  const t = useTranslations('documents');
  const params = useParams();
  const documentId = params.id as string;
  const { useGetCompanyDocuments } = useCompanyDocuments();
  const { data: documents, isLoading } = useGetCompanyDocuments();
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const document = documents?.find(doc => doc.id === documentId);

  useEffect(() => {
    const getUrl = async () => {
      if (document?.filePath) {
        const url = await CompanyDocumentService.getPublicUrl(document.filePath);
        setPublicUrl(url);
      }
    };
    getUrl();
  }, [document?.filePath]);

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
          {publicUrl && (
            <>
              <Button asChild variant="outline">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t('details.viewFile')}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={publicUrl} download className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {t('details.downloadFile')}
                </a>
              </Button>
            </>
          )}
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