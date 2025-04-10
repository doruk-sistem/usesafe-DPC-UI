"use client";

import { Box, CheckCircle, Clock, Download, Eye, MoreHorizontal, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const certifications = [
  {
    id: "DPC-001",
    productName: "Organic Cotton T-Shirt",
    manufacturer: "TechFabrics Ltd",
    manufacturerId: "MFR-001",
    category: "Textile",
    status: "pending",
    submittedAt: "2024-03-15T10:30:00",
    sustainabilityScore: 85,
    testReports: 3,
    certificates: 2,
  },
  {
    id: "DPC-002",
    productName: "Recycled Denim Jeans",
    manufacturer: "EcoTextiles Co",
    manufacturerId: "MFR-002",
    category: "Textile",
    status: "approved",
    submittedAt: "2024-03-14T15:45:00",
    sustainabilityScore: 92,
    testReports: 4,
    certificates: 3,
  },
  {
    id: "DPC-003",
    productName: "Bamboo Fiber Shirt",
    manufacturer: "Sustainable Wear",
    manufacturerId: "MFR-003",
    category: "Textile",
    status: "rejected",
    submittedAt: "2024-03-13T09:15:00",
    sustainabilityScore: 78,
    testReports: 2,
    certificates: 1,
  },
];

export function CertificationList() {
  const t = useTranslations("admin.dpc");
  const searchParams = useSearchParams();
  const manufacturerId = searchParams.get('manufacturer');

  const filteredCertifications = manufacturerId
    ? certifications.filter(cert => cert.manufacturerId === manufacturerId)
    : certifications;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.product")}</TableHead>
              <TableHead>{t("columns.category")}</TableHead>
              <TableHead>{t("columns.manufacturer")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead>{t("columns.score")}</TableHead>
              <TableHead>{t("columns.documents")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCertifications.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{cert.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {cert.id} · {new Date(cert.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{cert.category}</TableCell>
                <TableCell>{cert.manufacturer}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(cert.status)}
                    className="flex w-fit items-center gap-1"
                  >
                    {getStatusIcon(cert.status)}
                    {t(`status.${cert.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{cert.sustainabilityScore}%</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {cert.testReports} Reports · {cert.certificates} Certificates
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/admin/certifications/${cert.id}`}>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          {t("actions.view")}
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        {t("actions.download")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}