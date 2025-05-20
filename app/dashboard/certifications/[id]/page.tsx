'use client';

import { ArrowLeft, Download, Eye } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState , use } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { certificationService } from "@/lib/services/certification";


interface Props {
  params: Promise<{
    id: string;
  }>;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "expired":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default function CertificationDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const t = useTranslations("certifications");
  const [certification, setCertification] = useState<any>(null);
  const [publicUrl, setPublicUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cert = await certificationService.getCertificationDetails(resolvedParams.id);
        if (!cert) {
          notFound();
        }
        setCertification(cert);
        const url = await certificationService.getCertificationPublicUrl(cert.filePath);
        setPublicUrl(url);
      } catch (error) {
        console.error("Error fetching certification:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!certification) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/certifications">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t("detail.title")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t(`types.${certification.type.toLowerCase()}`)}</span>
            <Badge className={`${getStatusColor(certification.status)} text-white`}>
              {t(`status.${certification.status.toLowerCase()}`)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("detail.type")}</p>
              <p className="font-medium">{t(`types.${certification.type.toLowerCase()}`)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("detail.status")}</p>
              <p className="font-medium">{t(`status.${certification.status.toLowerCase()}`)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("detail.createdAt")}</p>
              <p className="font-medium">
                {new Date(certification.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("detail.updatedAt")}</p>
              <p className="font-medium">
                {new Date(certification.updatedAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button asChild className="flex-1">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {t("detail.view")}
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <a href={publicUrl} download className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t("detail.download")}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
