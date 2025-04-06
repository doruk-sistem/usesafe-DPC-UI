"use client";

import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast, useToast } from "@/components/ui/use-toast";

// Mock data - In a real app, this would come from an API
const documentsData = {
  "DOC-001": {
    id: "DOC-001",
    name: "ISO 9001:2015 Certificate",
    type: "Certification",
    manufacturer: "TechFabrics Ltd",
    status: "pending",
    validUntil: "2025-03-15",
    uploadedAt: "2024-03-15T10:30:00",
    fileSize: "2.4 MB",
    version: "1.0",
    description: "Quality Management System certification for textile manufacturing processes",
    issuer: "International Standards Organization",
    verificationStatus: {
      authenticity: "verified",
      completeness: "verified",
      signature: "pending",
      expiration: "valid",
    },
  },
};

interface DocumentDetailsProps {
  documentId: string;
}

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("details.documentInfo.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("details.documentInfo.id")}</p>
              <p className="font-medium">{document.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("details.documentInfo.version")}</p>
              <p className="font-medium">v{document.version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("details.documentInfo.type")}</p>
              <p className="font-medium">{document.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("details.documentInfo.fileSize")}</p>
              <p className="font-medium">{document.fileSize}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("details.documentInfo.uploadDate")}</p>
              <p className="font-medium">
                {new Date(document.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("details.documentInfo.validUntil")}</p>
              <p className="font-medium">
                {new Date(document.validUntil).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("details.documentInfo.description")}</p>
            <p className="mt-1">{document.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("details.verificationStatus.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(document.verificationStatus).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{t(`details.verificationStatus.${key}`)}</span>
                <Badge
                  variant={
                    value === "verified"
                      ? "success"
                      : value === "invalid"
                      ? "destructive"
                      : "warning"
                  }
                >
                  {t(`details.verificationStatus.${value}`)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {document.status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("details.adminReview.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comment">{t("details.adminReview.comment")}</Label>
                <Textarea
                  id="comment"
                  placeholder={t("details.adminReview.commentPlaceholder")}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}