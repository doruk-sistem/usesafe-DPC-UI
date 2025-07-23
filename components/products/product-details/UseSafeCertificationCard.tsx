"use client";

import { motion } from "framer-motion";
import { Shield, CheckCircle, Award, FileCheck, Building, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCompanyDocuments } from "@/lib/hooks/use-company-documents";
import { Document } from "@/lib/types/document";
import { BaseProduct } from "@/lib/types/product";

export interface UseSafeCertificationCardProps {
  title: string;
  product: BaseProduct;
  productDocuments: Document[];
}

export function UseSafeCertificationCard({ 
  title,
  product,
  productDocuments
}: UseSafeCertificationCardProps) {
  const t = useTranslations("products.details.usesafeCertification");
  const { useGetCompanyDocuments } = useCompanyDocuments();
  const { data: companyDocuments = [] } = useGetCompanyDocuments();

  // Şirket belgeleri onay durumu kontrolü (company_documents tablosundan)
  const getCompanyDocumentsScore = () => {
    if (!companyDocuments || companyDocuments.length === 0) {
      return { score: 0, status: "no-documents", message: t("company.noDocuments") };
    }

    const approvedDocs = companyDocuments.filter(doc => doc.status === "approved");
    const rejectedDocs = companyDocuments.filter(doc => doc.status === "rejected");
    const pendingDocs = companyDocuments.filter(doc => doc.status === "pending");

    if (rejectedDocs.length > 0) {
      return { score: 0, status: "rejected", message: t("company.hasRejected") };
    }

    if (pendingDocs.length > 0) {
      return { score: 0, status: "pending", message: t("company.hasPending") };
    }

    if (approvedDocs.length > 0 && approvedDocs.length === companyDocuments.length) {
      return { score: 20, status: "approved", message: t("company.allApproved") };
    }

    return { score: 0, status: "incomplete", message: t("company.incomplete") };
  };

  // Zorunlu ürün dökümanları onay durumu kontrolü (%40)
  const getProductDocumentsScore = () => {
    if (!productDocuments || productDocuments.length === 0) {
      return { score: 0, status: "no-documents", message: t("documents.noDocuments") };
    }

    const approvedDocs = productDocuments.filter(doc => doc.status === "approved");
    const rejectedDocs = productDocuments.filter(doc => doc.status === "rejected");
    const pendingDocs = productDocuments.filter(doc => doc.status === "pending");

    if (rejectedDocs.length > 0) {
      return { score: 0, status: "rejected", message: t("documents.hasRejected") };
    }

    if (pendingDocs.length > 0) {
      return { score: 0, status: "pending", message: t("documents.hasPending") };
    }

    if (approvedDocs.length > 0 && approvedDocs.length === productDocuments.length) {
      return { score: 40, status: "approved", message: t("documents.allApproved") };
    }

    return { score: 0, status: "incomplete", message: t("documents.incomplete") };
  };

  // DPP konfigürasyonu tamamlanma durumu kontrolü (%20)
  const getDppConfigScore = () => {
    if (!product.dpp_config || !product.dpp_config.sections) {
      return { score: 0, status: "no-config", message: t("dpp.noConfig") };
    }

    const sections = product.dpp_config.sections;
    const requiredSections = ["basic-info", "certifications", "environmental"];
    const completedSections = requiredSections.filter(sectionId => {
      const section = sections.find(s => s.id === sectionId);
      return section && section.fields && section.fields.length > 0;
    });

    if (completedSections.length === requiredSections.length) {
      return { score: 20, status: "complete", message: t("dpp.complete") };
    }

    const completionPercentage = (completedSections.length / requiredSections.length) * 100;
    return { 
      score: 0, 
      status: "incomplete", 
      message: t("dpp.incomplete", { percentage: completionPercentage.toFixed(0) })
    };
  };

  // Extra Certification bilgileri kontrolü (%20)
  const getExtraCertificationScore = () => {
    if (!companyDocuments || companyDocuments.length === 0) {
      return { score: 0, status: "no-certifications", message: t("extraCertifications.noCertifications") };
    }

    // ISO ve diğer kalite sertifikalarını filtrele
    const certificationTypes = [
      "iso_certificate", 
      "quality_certificate", 
      "export_certificate", 
      "production_permit"
    ];
    
    const extraCertifications = companyDocuments.filter(doc => 
      certificationTypes.includes(doc.type)
    );

    if (extraCertifications.length === 0) {
      return { score: 0, status: "no-certifications", message: t("extraCertifications.noCertifications") };
    }

    const approvedCerts = extraCertifications.filter(doc => doc.status === "approved");
    const rejectedCerts = extraCertifications.filter(doc => doc.status === "rejected");
    const pendingCerts = extraCertifications.filter(doc => doc.status === "pending");

    if (rejectedCerts.length > 0) {
      return { score: 0, status: "rejected", message: t("extraCertifications.hasRejected") };
    }

    if (pendingCerts.length > 0) {
      return { score: 0, status: "pending", message: t("extraCertifications.hasPending") };
    }

    if (approvedCerts.length > 0) {
      return { score: 20, status: "approved", message: t("extraCertifications.hasApproved") };
    }

    return { score: 0, status: "incomplete", message: t("extraCertifications.incomplete") };
  };

  const companyScore = getCompanyDocumentsScore();
  const documentsScore = getProductDocumentsScore();
  const dppScore = getDppConfigScore();
  const extraCertificationScore = getExtraCertificationScore();

  const totalScore = companyScore.score + documentsScore.score + dppScore.score + extraCertificationScore.score;
  const isUseSafeCertified = totalScore >= 60;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
      case "incomplete":
        return <Settings className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <Shield className="w-4 h-4 text-red-500" />;
      default:
        return <FileCheck className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="lg:col-span-2"
    >
      <Card className="bg-gradient-to-br from-background to-muted border-2">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>{title}</CardTitle>
            </div>
            <Badge 
              variant={isUseSafeCertified ? "success" : "secondary"}
              className="text-lg px-4 py-1"
            >
              {isUseSafeCertified ? (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {t("certified")}
                </div>
              ) : (
                t("notCertified")
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{t("progress")}</span>
              <span className={`text-sm font-semibold ${getScoreColor(totalScore)}`}>
                {totalScore}%
              </span>
            </div>
            <Progress value={totalScore} className="h-3" />
            <div className="text-xs text-muted-foreground mt-1">
              {t("requirementProgress", { required: 60 })}
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Şirket Belgeleri */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-card border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Building className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{t("company.title")}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg font-semibold ${getScoreColor(companyScore.score)}`}>
                  {companyScore.score}%
                </span>
                {getStatusIcon(companyScore.status)}
              </div>
              <p className="text-xs text-muted-foreground">{companyScore.message}</p>
            </motion.div>

            {/* Ürün Dökümanları */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-card border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <FileCheck className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{t("documents.title")}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg font-semibold ${getScoreColor(documentsScore.score)}`}>
                  {documentsScore.score}%
                </span>
                {getStatusIcon(documentsScore.status)}
              </div>
              <p className="text-xs text-muted-foreground">{documentsScore.message}</p>
            </motion.div>

            {/* DPP Konfigürasyonu */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-card border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{t("dpp.title")}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg font-semibold ${getScoreColor(dppScore.score)}`}>
                  {dppScore.score}%
                </span>
                {getStatusIcon(dppScore.status)}
              </div>
              <p className="text-xs text-muted-foreground">{dppScore.message}</p>
            </motion.div>

            {/* Extra Certifications */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-card border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{t("extraCertifications.title")}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg font-semibold ${getScoreColor(extraCertificationScore.score)}`}>
                  {extraCertificationScore.score}%
                </span>
                {getStatusIcon(extraCertificationScore.status)}
              </div>
              <p className="text-xs text-muted-foreground">{extraCertificationScore.message}</p>
            </motion.div>
          </div>

          {/* Certification Status */}
          {isUseSafeCertified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200"
            >
              <div className="flex items-center gap-2 text-green-700">
                <Award className="w-5 h-5" />
                <span className="font-semibold">{t("certificationAchieved")}</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                {t("certificationDescription")}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 