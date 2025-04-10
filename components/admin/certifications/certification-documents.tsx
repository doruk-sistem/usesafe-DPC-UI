"use client";

import { FileText, Download } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - In a real app, this would come from an API
const documentsData = {
  "DPC-001": [
    {
      id: "CERT-001",
      name: "GOTS Certificate",
      type: "Certification",
      status: "verified",
      uploadedAt: "2024-03-15T10:30:00",
      fileSize: "1.2 MB",
      issuer: "Global Organic Textile Standard",
    },
    {
      id: "CERT-002",
      name: "Fair Trade Certificate",
      type: "Certification",
      status: "pending",
      uploadedAt: "2024-03-15T10:31:00",
      fileSize: "890 KB",
      issuer: "Fair Trade International",
    },
    {
      id: "DOC-001",
      name: "Material Declaration",
      type: "Declaration",
      status: "verified",
      uploadedAt: "2024-03-15T10:32:00",
      fileSize: "450 KB",
      issuer: "TechFabrics Ltd",
    },
  ],
};

interface CertificationDocumentsProps {
  certificationId: string;
}

export function CertificationDocuments({ certificationId }: CertificationDocumentsProps) {
  const t = useTranslations("admin.dpc");
  const documents = documentsData[certificationId] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("documents.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.length === 0 ? (
            <p className="text-muted-foreground">{t("documents.noDocuments")}</p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-start gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{doc.type}</span>
                      <span>·</span>
                      <span>{doc.fileSize}</span>
                      <span>·</span>
                      <span>Issued by {doc.issuer}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={doc.status === "verified" ? "success" : "warning"}
                  >
                    {t(`details.status.${doc.status}`)}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}