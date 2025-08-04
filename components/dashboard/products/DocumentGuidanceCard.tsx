"use client";

import { AlertCircle, CheckCircle, Info, RefreshCw, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductDocumentGuidance } from "@/lib/services/chatgpt";

interface DocumentGuidanceCardProps {
  guidance: ProductDocumentGuidance | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  productTypeLabel?: string; // Gerçek category ismi
  subcategoryLabel?: string; // Gerçek subcategory ismi
}

export function DocumentGuidanceCard({
  guidance,
  isLoading,
  error,
  onRefresh,
  productTypeLabel,
  subcategoryLabel,
}: DocumentGuidanceCardProps) {
  const t = useTranslations("aiGuidance");

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">{t("guidanceUnavailable")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("tryAgain")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!guidance) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-800">{t("aiDocumentGuidance")}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-blue-700">
          {t("recommendedDocumentsFor")} {productTypeLabel || guidance.productType} - {subcategoryLabel || guidance.subcategory}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zorunlu Belgeler */}
        {guidance.requiredDocuments.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {t("requiredDocuments")}
            </h4>
            <div className="space-y-3">
              {guidance.requiredDocuments.map((doc, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-green-800">{doc.label}</h5>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {t("required")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                  {doc.examples.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">{t("examples")}:</p>
                      <div className="flex flex-wrap gap-1">
                        {doc.examples.map((example, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opsiyonel Belgeler */}
        {guidance.optionalDocuments.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t("optionalDocuments")}
            </h4>
            <div className="space-y-3">
              {guidance.optionalDocuments.map((doc, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-blue-800">{doc.label}</h5>
                    <Badge variant="outline" className="text-blue-600">
                      {t("optional")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                  {doc.examples.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">{t("examples")}:</p>
                      <div className="flex flex-wrap gap-1">
                        {doc.examples.map((example, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Genel Notlar */}
        {guidance.generalNotes && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="text-sm font-medium text-gray-700">{t("generalNotes")}</span>
                <Info className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">{guidance.generalNotes}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Uyumluluk Notları */}
        {guidance.complianceNotes && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="text-sm font-medium text-gray-700">{t("complianceRequirements")}</span>
                <AlertCircle className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">{guidance.complianceNotes}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
} 