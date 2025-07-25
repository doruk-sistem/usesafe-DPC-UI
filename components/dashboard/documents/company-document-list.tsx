"use client";

import { FileText, MoreHorizontal, Download, History, ExternalLink, AlertTriangle, Plus } from "lucide-react";
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
import { Loading } from "@/components/ui/loading";
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
import { useCompanyDocuments } from "@/lib/hooks/use-company-documents";
import { Document } from "@/lib/types/document";
import { getStatusIcon } from "@/lib/utils/document-utils";

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("documents.title")}</CardTitle>
              <CardDescription>
                {t("documents.description")}
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/documents/upload">
                <Plus className="h-4 w-4 mr-2" />
                {t("documents.filters.upload")}
              </Link>
            </Button>
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("documents.title")}</CardTitle>
              <CardDescription>
                {t("documents.description")}
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/documents/upload">
                <Plus className="h-4 w-4 mr-2" />
                {t("documents.filters.upload")}
              </Link>
            </Button>
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("documents.title")}</CardTitle>
              <CardDescription>
                {t("documents.description")}
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/documents/upload">
                <Plus className="h-4 w-4 mr-2" />
                {t("documents.filters.upload")}
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("documents.list.empty.title")}</h3>
            <p className="text-muted-foreground">
              {t("documents.list.empty.description")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("documents.title")}</CardTitle>
            <CardDescription>
              {t("documents.description")}
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/documents/upload">
              <Plus className="h-4 w-4 mr-2" />
              {t("documents.filters.upload")}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("documents.table.document")}</TableHead>
              <TableHead>{t("documents.table.type")}</TableHead>
              <TableHead>{t("documents.table.status")}</TableHead>
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
                <TableCell>
                  <Badge
                    variant={getStatusVariant(doc.status)}
                    className="flex w-fit items-center gap-1"
                  >
                    {getStatusIcon(doc.status)}
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("documents.actions.title")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          {t("documents.actions.view")}
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={doc.url} download>
                          <Download className="h-4 w-4 mr-2" />
                          {t("documents.actions.download")}
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/documents/${doc.id}/history`}>
                          <History className="h-4 w-4 mr-2" />
                          {t("documents.actions.history")}
                        </Link>
                      </DropdownMenuItem>
                      {doc.status === "rejected" && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/documents/${doc.id}/reupload`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t("documents.actions.reupload")}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        {t("documents.actions.delete")}
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