"use client";

import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface DocumentDetailsProps {
  documentId: string;
}

interface Document {
  id: string;
  name: string;
  status: "approved" | "rejected" | "pending";
  // Add other document properties as needed
}

// Temporary mock data - replace with API call
const documentsData: Record<string, Document> = {
  "1": {
    id: "1",
    name: "Document 1",
    status: "pending",
  },
  // Add more mock documents as needed
};

export function DocumentDetails({ documentId }: DocumentDetailsProps) {
  const t = useTranslations("documentManagement.repository");
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const document = documentsData[documentId];

  const handleApprove = async () => {
    try {
      // TODO: API çağrısı eklenecek
      toast({
        title: t("toast.approved.title"),
        description: t("toast.approved.description"),
      });
    } catch (error) {
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.approveDescription"),
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast({
        title: t("toast.error.title"),
        description: "Lütfen bir yorum ekleyin",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: API çağrısı eklenecek
      toast({
        title: t("toast.rejected.title"),
        description: t("toast.rejected.description"),
      });
    } catch (error) {
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.rejectDescription"),
        variant: "destructive",
      });
    }
  };

  if (!document) {
    return <div>{t("noData.title")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("details.backToList")}
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{document.name}</h1>
          <Badge
            variant={
              document.status === "approved"
                ? "success"
                : document.status === "rejected"
                ? "destructive"
                : "warning"
            }
          >
            {t(`status.${document.status}`)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("actions.download")}
          </Button>
          {document.status === "pending" && (
            <>
              <Button variant="outline" onClick={handleReject}>
                {t("actions.reject")}
              </Button>
              <Button onClick={handleApprove}>
                {t("actions.approve")}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
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
                <p className="text-sm text-muted-foreground">
                  {t(`status.${document.status}`)}
                </p>
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
      </div>
    </div>
  );
}