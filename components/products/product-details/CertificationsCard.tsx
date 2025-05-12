"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDocuments } from "@/lib/services/documents";
import { Document } from "@/lib/types/document";

interface CertificationsCardProps {
  title: string;
  productId: string;
}

export function CertificationsCard({ 
  title,
  productId
}: CertificationsCardProps) {
  const t = useTranslations("products.details.certifications");
  const [certifications, setCertifications] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        if (!productId) {
          setError('Product ID is required');
          setLoading(false);
          return;
        }

        const { documents } = await getDocuments(productId);

        // Show all document types
        const certificationDocs = documents;

        setCertifications(certificationDocs);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load certifications');
        setLoading(false);
      }
    };

    fetchCertifications();
  }, [productId]);

  const getStatusVariant = (status: Document["status"]) => {
    switch (status) {
      case "approved":
      case "valid":
        return "success";
      case "rejected":
      case "expired":
        return "destructive";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">{t("loadingCertifications")}</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-destructive">
            <p className="font-medium">{t("errorLoadingCertifications")}</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (certifications.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {t("noCertifications")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.name")}</TableHead>
                <TableHead>{t("table.issuedBy")}</TableHead>
                <TableHead>{t("table.validUntil")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.document")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certifications.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>{cert.name}</TableCell>
                  <TableCell>{cert.notes || "N/A"}</TableCell>
                  <TableCell>
                    {cert.validUntil 
                      ? new Date(cert.validUntil).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(cert.status)}>
                      {t(`status.${cert.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {cert.url ? (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={cert.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          {t("actions.download")}
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t("actions.noDocument")}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </CardContent>
    </Card>
  );
} 