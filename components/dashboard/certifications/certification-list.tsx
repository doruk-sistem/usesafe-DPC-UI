"use client";

import { Battery, MoreHorizontal, FileText, ExternalLink } from "lucide-react";
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
import { useAuth } from "@/lib/hooks/use-auth";
import { companyApiHooks } from "@/lib/hooks/use-company";
import { DocumentType } from "@/lib/types/company";

import { getStatusIcon } from "../../../lib/utils/document-utils";

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
  const t = useTranslations('certifications');
  const { user, company } = useAuth();
  const searchParams = useSearchParams();
  const manufacturerId = searchParams.get('manufacturer');
  const isViewingManufacturer = !!manufacturerId;
  const companyId = manufacturerId || user?.user_metadata?.company_id || company?.id;

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
        return t('status.approved');
      case "rejected":
        return t('status.rejected');
      default:
        return t('status.pending');
    }
  };

  const getDocumentType = (type: string) => {
    switch (type) {
      case "quality_certificate":
        return t('types.quality');
      case "iso_certificate":
        return t('types.iso');
      case "production_permit":
        return t('types.production');
      case "export_certificate":
        return t('types.export');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>
            {t('list.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">{t('list.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>
            {t('list.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-destructive">
            <p className="font-medium">{t('list.error.title')}</p>
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
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>
            {t('list.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {isViewingManufacturer ? (
              <p>{t('list.empty.manufacturer')}</p>
            ) : (
              <>
                <p>{t('list.empty.title')}</p>
                <p className="mt-2">{t('list.empty.description')}</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/certifications/new">
                    {t('list.empty.addButton')}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('list.title')}</CardTitle>
        <CardDescription>
          {t('list.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('list.table.document')}</TableHead>
              <TableHead>{t('list.table.type')}</TableHead>
              <TableHead>{t('list.table.status')}</TableHead>
              <TableHead>{t('list.table.applicationDate')}</TableHead>
              <TableHead>{t('list.table.updateDate')}</TableHead>
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
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/dashboard/certifications/${doc.id}`}>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {t('list.actions.view')}
                        </DropdownMenuItem>
                      </Link>
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