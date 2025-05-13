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
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface DocumentDetailsProps {
  documentId: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  status: "approved" | "rejected" | "pending" | "expired";
  version: number;
  validUntil: string;
  fileSize?: string;
  url: string;
  rejection_reason?: string;
}

export function DocumentDetails({ documentId }: DocumentDetailsProps) {
  const t = useTranslations("documentManagement.repository");
  const { toast } = useToast();
  const [comment, setComment] = useState("");

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

  if (!documentId) {
    return <div>{t("noData.title")}</div>;
  }

  // Mock document data (API'den alınacak şekilde ayarlanmalı)
  const document: Document = {
    id: documentId,
    name: "Örnek PDF Adı.pdf",
    type: "PDF",
    status: "pending",
    version: 1,
    validUntil: new Date().toISOString(),
    fileSize: "1.2 MB",
    url: "#",
    rejection_reason: undefined,
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "expired":
        return "warning";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

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
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("actions.download")}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("details.documentInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>{t("details.name")}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="font-medium truncate max-w-[200px]">
                      {document.name && document.name.length > 25 ? `${document.name.slice(0, 25)}...` : document.name}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">
                    <p className="max-w-[300px] break-words text-xs">{document.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-muted-foreground">
                {document.id} {document.fileSize ? `· ${document.fileSize}` : ""}
              </p>
            </div>
            <div>
              <Label>{t("details.type")}</Label>
              <p className="text-sm text-muted-foreground">{document.type}</p>
            </div>
            <div>
              <Label>{t("details.status")}</Label>
              <Badge variant={getStatusVariant(document.status)} className="flex w-fit items-center gap-1">
                {document.status ? document.status.toUpperCase() : 'PENDING'}
              </Badge>
              {document.status === "rejected" && document.rejection_reason && (
                <div className="mt-1 text-xs text-red-500">
                  Reason: {document.rejection_reason}
                </div>
              )}
            </div>
            <div>
              <Label>{t("details.validUntil")}</Label>
              <p className="text-sm text-muted-foreground">
                {document.validUntil ? new Date(document.validUntil).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <Label>{t("details.version")}</Label>
              <p className="text-sm text-muted-foreground">v{document.version}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}