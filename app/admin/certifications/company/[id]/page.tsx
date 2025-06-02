"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { certificationService } from "@/lib/services/certification";

// Sertifika tipleri - Sertifika yükleme formundaki değerlerle eşleşecek şekilde güncellendi
const CERTIFICATE_TYPES = [
  'iso_certificate',
  'quality_certificate',
  'export_certificate',
  'production_permit'
] as const;

interface Certification {
  id: string;
  type: string;
  status: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  name: string;
}

export default function CompanyCertificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const t = useTranslations("admin.certifications");
  const [company, setCompany] = useState<Company | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Şirket bilgilerini çek
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("id, name")
          .eq("id", resolvedParams.id)
          .single();

        if (companyError) {
          throw new Error(`Company fetch error: ${companyError.message}`);
        }

        setCompany(companyData);

        // Sertifikaları çek
        const { data: documents, error: documentsError } = await supabase
          .from("company_documents")
          .select("*")
          .eq("companyId", resolvedParams.id)
          .in('type', CERTIFICATE_TYPES)
          .order("createdAt", { ascending: false });

        if (documentsError) {
          throw new Error(`Documents fetch error: ${documentsError.message}`);
        }

        setCertifications(documents || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "warning";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div>Company not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/certifications">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{company.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {certifications.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <div className="space-y-4">
              {certifications.map((certification) => (
                <div
                  key={certification.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{t(`types.${certification.type}`)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(certification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={getStatusVariant(certification.status)}>
                      {t(`status.${certification.status}`)}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const url = await certificationService.getCertificationPublicUrl(certification.filePath);
                        window.open(url, '_blank');
                      }}
                    >
                      {t("actions.download")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 