"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

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

interface Certification {
  name: string;
  issuedBy: string;
  validUntil: string;
  status: "active" | "expired" | "pending" | "unknown";
  documentUrl?: string;
}

interface CertificationsCardProps {
  certifications: Certification[];
  itemVariants: any;
}

export function CertificationsCard({ 
  certifications, 
  itemVariants 
}: CertificationsCardProps) {
  const t = useTranslations("products.details.certifications");

  const getStatusVariant = (status: Certification["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "expired":
        return "destructive";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div variants={itemVariants}>
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
              {certifications.map((cert, index) => (
                <TableRow key={index}>
                  <TableCell>{cert.name}</TableCell>
                  <TableCell>{cert.issuedBy}</TableCell>
                  <TableCell>{new Date(cert.validUntil).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(cert.status)}>
                      {t(`status.${cert.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {cert.documentUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={cert.documentUrl}>
                          <Download className="h-4 w-4 mr-2" />
                          {t("actions.download")}
                        </Link>
                      </Button>
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