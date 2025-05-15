"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentHistory } from "@/components/dashboard/documents/document-history";
import { useAuth } from "@/lib/hooks/use-auth";
import { documentsApiHooks } from "@/lib/hooks/use-documents";

export default function DocumentDetailsPage() {
  const t = useTranslations("documentManagement.repository");
  const { user } = useAuth();
  const params = useParams();
  const id = params?.id as string;
  const [comment, setComment] = useState("");

  const { data: document, isLoading } = documentsApiHooks.useGetDocumentByCompanyId(
    user?.user_metadata?.company_id,
    id
  );

  if (isLoading) return <div>Loading...</div>;
  if (!document) return <div>{t("noData.title")}</div>;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("details.backToList")}
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{document.name}</h1>
          <Badge variant={getStatusVariant(document.status)}>
            {t(`status.${document.status}`)}
          </Badge>
        </div>
        <div className="flex gap-2">
          {document.url && (
            <Button variant="outline" asChild>
              <a href={document.url} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                {t("actions.download")}
              </a>
            </Button>
          )}
        </div>
      </div>
      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="validation">{t("tabs.validation")}</TabsTrigger>
          <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
        </TabsList>
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("details.documentInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>{t("details.name")}</Label>
                  <p className="text-sm text-muted-foreground">{document.name}</p>
                </div>
                <div>
                  <Label>{t("details.status")}</Label>
                  <p className="text-sm text-muted-foreground">{t(`status.${document.status}`)}</p>
                </div>
                {document.status === "pending" && (
                  <div>
                    <Label htmlFor="comment">{t("details.comment")}</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t("details.commentPlaceholder")}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <DocumentHistory documentId={document.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 