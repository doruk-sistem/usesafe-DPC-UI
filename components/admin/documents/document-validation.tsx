"use client";

import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStatusColor, getStatusIcon } from "@/lib/utils/document-utils";

type ValidationStatus = "verified" | "valid" | "failed" | "warning" | "pending";

interface ValidationCheck {
  status: ValidationStatus;
  details: string;
  timestamp: string;
}

interface DocumentValidation {
  authenticity: ValidationCheck;
  completeness: ValidationCheck;
  format: ValidationCheck;
  expiration: ValidationCheck;
  issuerVerification: ValidationCheck;
}

// Mock data - In a real app, this would come from an API
const validationData: Record<string, DocumentValidation> = {
  "DOC-001": {
    authenticity: {
      status: "verified",
      details: "Dijital imza başarıyla doğrulandı",
      timestamp: "2024-03-15T10:31:00",
    },
    completeness: {
      status: "verified",
      details: "Tüm gerekli alanlar mevcut",
      timestamp: "2024-03-15T10:32:00",
    },
    format: {
      status: "verified",
      details: "Belge formatı gereksinimleri karşılıyor",
      timestamp: "2024-03-15T10:33:00",
    },
    expiration: {
      status: "valid",
      details: "Belge geçerlilik süresi içinde",
      timestamp: "2024-03-15T10:34:00",
    },
    issuerVerification: {
      status: "pending",
      details: "Düzenleyen doğrulaması devam ediyor",
      timestamp: "2024-03-15T10:35:00",
    },
  },
};

interface DocumentValidationProps {
  documentId: string;
}

export function DocumentValidation({ documentId }: DocumentValidationProps) {
  const t = useTranslations("documentManagement.repository.validation");
  const validation = validationData[documentId];

  if (!validation) {
    return <div>{t("noData.title")}</div>;
  }

  const calculateProgress = () => {
    const total = Object.keys(validation).length;
    const completed = Object.values(validation).filter(
      (check) => check.status === "verified" || check.status === "valid"
    ).length;
    return (completed / total) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("title")}</span>
          <Progress value={calculateProgress()} className="w-[100px]" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(validation).map(([key, check]) => (
          <div key={key} className="flex items-start gap-4">
            {getStatusIcon(check.status)}
            <div className="flex-1 space-y-1">
              <p className="font-medium capitalize">{t(`checks.${key}.title`)}</p>
              <p className="text-sm text-muted-foreground">{t(`checks.${key}.${check.status}`)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(check.timestamp).toLocaleString()}
              </p>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(check.status)} capitalize`}>
              {t(`checks.${check.status}`)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}