"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useTranslations } from 'next-intl';
import Link from "next/link";

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
  status: "valid" | "expired" | "unknown";
  documentUrl?: string;
}

interface CertificationsCardProps {
  title: string;
  certifications: Certification[];
}

export function CertificationsCard({ 
  title,
  certifications
}: CertificationsCardProps) {
  const t = useTranslations('product.details');

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'valid':
        return 'success';
      case 'expired':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    return t(`certifications.status.${status}`);
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('certifications.title')}</TableHead>
              <TableHead>{t('certifications.issuedBy')}</TableHead>
              <TableHead>{t('certifications.validUntil')}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Document</TableHead>
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
                    {getStatusText(cert.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {cert.documentUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={cert.documentUrl}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 