"use client";

import { FileText, MoreHorizontal, Download, History, ExternalLink, AlertTriangle } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loading } from "@/components/ui/loading";

import { getStatusIcon } from "@/lib/utils/document-utils";
import { useCompanyDocuments } from "@/lib/hooks/use-company-documents";
import { Document } from "@/lib/types/document";

export function CompanyDocumentList() {
  const t = useTranslations();
  const { useGetCompanyDocuments } = useCompanyDocuments();
  const { data: documents, isLoading, error } = useGetCompanyDocuments();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "expiring":
        return "warning";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("companyDocuments.title")}</CardTitle>
          <CardDescription>
            {t("companyDocuments.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Loading />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("companyDocuments.title")}</CardTitle>
          <CardDescription>
            {t("companyDocuments.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("error.title")}</h3>
            <p className="text-muted-foreground">
              {t("error.description")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("companyDocuments.title")}</CardTitle>
          <CardDescription>
            {t("companyDocuments.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("noDocumentsFound")}</h3>
            <p className="text-muted-foreground">
              {t("noDocumentsDescription")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("companyDocuments.title")}</CardTitle>
        <CardDescription>
          {t("companyDocuments.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("documents.repository.columns.document")}</TableHead>
              <TableHead>{t("documents.repository.columns.type")}</TableHead>
              <TableHead>{t("documents.repository.columns.category")}</TableHead>
              <TableHead>{t("documents.repository.columns.status")}</TableHead>
              <TableHead>{t("documents.repository.columns.validUntil")}</TableHead>
              <TableHead>{t("documents.repository.columns.issuer")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc: Document) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="font-medium truncate max-w-[200px]">
                              {doc.name.length > 25 
                                ? `${doc.name.slice(0, 25)}...` 
                                : doc.name}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start">
                            <p className="max-w-[300px] break-words text-xs">{doc.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <p className="text-sm text-muted-foreground">
                        {doc.id} · {doc.fileSize}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.category}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(doc.status)}
                    className="flex w-fit items-center gap-1"
                  >
                    {getStatusIcon(doc.status)}
                    {t(`documentManagement.status.${doc.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {doc.validUntil ? new Date(doc.validUntil).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>{doc.manufacturer || "N/A"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("documents.repository.actions.title")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/company/documents/${doc.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          {t("documents.repository.actions.view")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        {t("documents.repository.actions.download")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <History className="h-4 w-4 mr-2" />
                        {t("documents.repository.actions.history")}
                      </DropdownMenuItem>
                      {doc.status === "rejected" && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/company/documents/${doc.id}/reupload`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t("documents.repository.actions.reupload")}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        {t("documents.repository.actions.delete")}
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