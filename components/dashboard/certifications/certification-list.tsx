"use client";

import { Battery, MoreHorizontal, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

import { getStatusIcon } from "../../../lib/utils/document-utils";
import { companyApiHooks } from "@/lib/hooks/use-company";
import { DocumentType } from "@/lib/types/company";
import { useAuth } from "@/lib/hooks/use-auth";

interface CompanyDocument {
  id: string;
  companyId: string;
  type: DocumentType;
  filePath: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  type: string;
  status: string;
}

interface CertificationListProps {
  filters: FilterState;
}

export function CertificationList({ filters }: CertificationListProps) {
  const { user, company } = useAuth();
  const companyId = user?.user_metadata?.company_id || company?.id;

  const { data: allDocuments, isLoading, error } = companyApiHooks.useGetCompanyDocumentsQuery(
    { companyId },
    { enabled: !!companyId }
  );
  
  const filteredDocuments = allDocuments?.filter(doc => {
    const typeMatch = filters.type === "all" || doc.type === filters.type;
    const statusMatch = filters.status === "all-status" || doc.status === filters.status;
    return typeMatch && statusMatch;
  });

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Onaylandı";
      case "rejected":
        return "Reddedildi";
      default:
        return "Beklemede";
    }
  };

  const getDocumentType = (type: string) => {
    switch (type) {
      case "quality_certificate":
        return "Kalite Sertifikası";
      case "iso_certificate":
        return "ISO Sertifikası";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sertifika Listesi</CardTitle>
          <CardDescription>
            Tüm sertifikalarınızı buradan görüntüleyebilir ve yönetebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Yükleniyor...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sertifika Listesi</CardTitle>
          <CardDescription>
            Tüm sertifikalarınızı buradan görüntüleyebilir ve yönetebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-destructive">
            <p className="font-medium">Hata</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredDocuments || filteredDocuments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sertifika Listesi</CardTitle>
          <CardDescription>
            Tüm sertifikalarınızı buradan görüntüleyebilir ve yönetebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>Henüz sertifika bulunmuyor</p>
            <p className="mt-2">Kayıt belgeleri bu sayfada gösterilmez. Yeni sertifika eklemek için "Yeni Sertifika" butonunu kullanın.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sertifika Listesi</CardTitle>
        <CardDescription>
          Tüm sertifikalarınızı buradan görüntüleyebilir ve yönetebilirsiniz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Döküman</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Başvuru Tarihi</TableHead>
              <TableHead>Güncellenme Tarihi</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {doc.filePath ? doc.filePath.split("/").pop() : getDocumentType(doc.type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getDocumentType(doc.type)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getDocumentType(doc.type)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(doc.status)}
                    className="flex w-fit items-center gap-1"
                  >
                    {getStatusIcon(doc.status)}
                    {getStatusText(doc.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(doc.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">İşlemler</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/certifications/${doc.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Görüntüle
                        </Link>
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