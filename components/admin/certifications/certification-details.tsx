"use client";

import { ArrowLeft, Box, Download } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Mock data - In a real app, this would come from an API
const certificationsData = {
  "DPC-001": {
    id: "DPC-001",
    productName: "Organic Cotton T-Shirt",
    manufacturer: "TechFabrics Ltd",
    category: "Textile",
    status: "pending",
    submittedAt: "2024-03-15T10:30:00",
    sustainabilityScore: 85,
    materials: [
      { name: "Organic Cotton", percentage: 95, sustainable: true },
      { name: "Elastane", percentage: 5, sustainable: false },
    ],
    productionMethod: "Sustainable Manufacturing",
    dyeingProcess: "Natural Dyes",
    certifications: [
      { name: "GOTS Certified", status: "verified" },
      { name: "Fair Trade", status: "pending" },
    ],
    testReports: [
      { name: "Chemical Safety", status: "passed" },
      { name: "Color Fastness", status: "passed" },
      { name: "Durability", status: "pending" },
    ],
  },
};

interface CertificationDetailsProps {
  certificationId: string;
}

export function CertificationDetails({ certificationId }: CertificationDetailsProps) {
  const t = useTranslations("admin.dpc");
  const certification = certificationsData[certificationId];

  if (!certification) {
    return <div>{t("details.notFound")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/certifications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("details.backButton")}
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{certification.productName}</h1>
          <Badge
            variant={
              certification.status === "approved"
                ? "success"
                : certification.status === "rejected"
                ? "destructive"
                : "warning"
            }
          >
            {t(`status.${certification.status}`)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("details.exportDPC")}
          </Button>
          <Button variant="outline">{t("details.reject")}</Button>
          <Button>{t("details.approve")}</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              {t("details.productInfo.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("details.productInfo.category")}</p>
                <p className="font-medium">{certification.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("details.productInfo.manufacturer")}</p>
                <p className="font-medium">{certification.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("details.productInfo.productionMethod")}</p>
                <p className="font-medium">{certification.productionMethod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("details.productInfo.dyeingProcess")}</p>
                <p className="font-medium">{certification.dyeingProcess}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">{t("details.productInfo.materials")}</p>
              <div className="space-y-2">
                {certification.materials.map((material, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{material.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={material.sustainable ? "success" : "secondary"}>
                        {material.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("details.certificationStatus.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t("details.certificationStatus.sustainabilityScore")}</span>
                <span>{certification.sustainabilityScore}%</span>
              </div>
              <Progress value={certification.sustainabilityScore} className="h-2" />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t("details.certificationStatus.requiredCertifications")}</p>
                <div className="space-y-2">
                  {certification.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{cert.name}</span>
                      <Badge
                        variant={cert.status === "verified" ? "success" : "warning"}
                      >
                        {t(`details.status.${cert.status}`)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">{t("details.certificationStatus.testReports")}</p>
                <div className="space-y-2">
                  {certification.testReports.map((test, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{test.name}</span>
                      <Badge
                        variant={test.status === "passed" ? "success" : "warning"}
                      >
                        {t(`details.status.${test.status}`)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}