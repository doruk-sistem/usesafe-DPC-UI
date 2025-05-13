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

interface DocumentValidationProps {
  documentId: string;
}

export function DocumentValidation({ documentId }: DocumentValidationProps) {
  const t = useTranslations("documentManagement.repository.validation");

  // TODO: Replace with real API/hook call
  // Example: const { data: validation, isLoading } = useDocumentValidation(documentId);
  const validation: DocumentValidation | null = null;

  const calculateProgress = () => {
    if (!validation) return 0;
    const total = Object.keys(validation).length;
    const completed = Object.values(validation).filter(
      (check) => (check as ValidationCheck).status === "verified" || (check as ValidationCheck).status === "valid"
    ).length;
    return (completed / total) * 100;
  };

  if (!validation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("noData.title")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("title")}</span>
          <Progress value={calculateProgress()} className="w-[100px]" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(validation).map(([key, check]) => {
          const typedCheck = check as ValidationCheck;
          return (
            <div key={key} className="flex items-start gap-4">
              {getStatusIcon(typedCheck.status)}
              <div className="flex-1 space-y-1">
                <p className="font-medium capitalize">{t(`checks.${key}.title`)}</p>
                <p className="text-sm text-muted-foreground">{t(`checks.${key}.${typedCheck.status}`)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(typedCheck.timestamp).toLocaleString()}
                </p>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(typedCheck.status)} capitalize`}>
                {t(`checks.${typedCheck.status}`)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}