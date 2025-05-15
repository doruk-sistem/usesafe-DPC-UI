"use client";

import { Battery, MoreHorizontal, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
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

export function CertificationList() {
  const t = useTranslations();
  const { user, company } = useAuth();
  const companyId = user?.user_metadata?.company_id || company?.id;

  const { data: documents, isLoading, error } = companyApiHooks.useGetCompanyDocumentsQuery(
    { companyId },
    { enabled: !!companyId }
  );

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dpc.applications.title")}</CardTitle>
          <CardDescription>
            {t("dpc.applications.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">{t("loading")}</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dpc.applications.title")}</CardTitle>
          <CardDescription>
            {t("dpc.applications.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-destructive">
            <p className="font-medium">{t("error")}</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dpc.applications.title")}</CardTitle>
          <CardDescription>
            {t("dpc.applications.description")}
          </CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle>{t("dpc.applications.title")}</CardTitle>
        <CardDescription>
          {t("dpc.applications.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dpc.applications.columns.document")}</TableHead>
              <TableHead>{t("dpc.applications.columns.type")}</TableHead>
              <TableHead>{t("dpc.applications.columns.status")}</TableHead>
              <TableHead>{t("dpc.applications.columns.submitted")}</TableHead>
              <TableHead>{t("dpc.applications.columns.updated")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {doc.filePath ? doc.filePath.split("/").pop() : t(`documents.types.${doc.type}`)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(`documents.types.${doc.type}`)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {t(`documents.types.${doc.type}`)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(doc.status)}
                    className="flex w-fit items-center gap-1"
                  >
                    {getStatusIcon(doc.status)}
                    {t(`dpc.applications.status.${doc.status}`)}
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
                        <span className="sr-only">{t("dpc.applications.actions.title")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("dpc.applications.actions.title")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/certifications/${doc.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          {t("dpc.applications.actions.view")}
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