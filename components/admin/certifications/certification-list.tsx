"use client";

import { Box, Download, Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStatusIcon } from "@/lib/utils/document-utils";
import { certificationService } from "@/lib/services/certification";
import { supabase } from "@/lib/supabase/client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  companyId: string;
  company: {
    name: string;
  };
}

interface CompanyCertifications {
  [key: string]: {
    companyName: string;
    certifications: Certification[];
  };
}

const ITEMS_PER_PAGE = 10;

export function CertificationList() {
  const t = useTranslations("admin.certifications");
  const searchParams = useSearchParams();
  const [companyCertifications, setCompanyCertifications] = useState<CompanyCertifications>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Önce şirketleri çekelim
        const { data: companies, error: companiesError } = await supabase
          .from("companies")
          .select("id, name");

        if (companiesError) {
          throw new Error(`Companies fetch error: ${companiesError.message}`);
        }

        // Sonra sertifikaları çekelim
        const { data: documents, error: documentsError } = await supabase
          .from("company_documents")
          .select("*")
          .in('type', CERTIFICATE_TYPES)
          .order("createdAt", { ascending: false });

        if (documentsError) {
          throw new Error(`Documents fetch error: ${documentsError.message}`);
        }

        // Şirket ve sertifika verilerini birleştir
        const grouped = (documents || []).reduce((acc: CompanyCertifications, doc: any) => {
          const company = companies?.find(c => c.id === doc.companyId);
          if (!company) return acc;

          if (!acc[doc.companyId]) {
            acc[doc.companyId] = {
              companyName: company.name,
              certifications: []
            };
          }
          acc[doc.companyId].certifications.push({
            ...doc,
            company: { name: company.name }
          });
          return acc;
        }, {});

        setCompanyCertifications(grouped);
        setTotalPages(Math.ceil(Object.keys(grouped).length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching certifications:", error);
        setError(error instanceof Error ? error.message : "An error occurred while fetching certifications");
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

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

  const paginatedCompanies = Object.entries(companyCertifications)
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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

  if (Object.keys(companyCertifications).length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div>{t("empty")}</div>
        </CardContent>
      </Card>
    );
  }

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
              <TableHead>{t("columns.company")}</TableHead>
              <TableHead>{t("columns.certificationCount")}</TableHead>
              <TableHead>{t("columns.lastUpdated")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCompanies.map(([companyId, data]) => (
              <TableRow key={companyId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{data.companyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {companyId}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {data.certifications.length} {t("columns.certifications")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(
                    Math.max(...data.certifications.map(c => new Date(c.updatedAt).getTime()))
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/admin/certifications/company/${companyId}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      {t("actions.view")}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}