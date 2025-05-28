"use client";

import { FileText, MoreHorizontal, Download, History, ExternalLink, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React from "react";

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

import { getStatusIcon } from "../../../lib/utils/document-utils";
import { documentsApiHooks } from "@/lib/hooks/use-documents";
import { Document, DocumentType } from "@/lib/types/document";
import { Loading } from "@/components/ui/loading";
import { useCompanyDocuments } from "@/lib/hooks/use-company-documents";
import { useAuth } from "@/lib/hooks/use-auth";

// Döküman tipleri
const DOCUMENT_TYPES = [
  'signature_circular',
  'trade_registry_gazette',
  'tax_plate',
  'activity_certificate'  // Faaliyet Belgesi (döküman)
] as const;

export function DocumentList({ filters }: { filters: { type: string; status: string } }) {
  const t = useTranslations('documents');
  const { useGetCompanyDocuments } = useCompanyDocuments();
  const { data: allDocuments, isLoading, error } = useGetCompanyDocuments();
  const { user } = useAuth();

  // Filtreleme işlemi
  const filteredDocuments = React.useMemo(() => {
    if (!allDocuments) return [];
    let result = [...allDocuments];
    
    // Sadece döküman tiplerini filtrele
    result = result.filter(doc => DOCUMENT_TYPES.includes(doc.type as DocumentType));
    
    if (filters.type && filters.type !== 'all') {
      result = result.filter(doc => doc.type === filters.type);
    }
    if (filters.status && filters.status !== 'all-status') {
      result = result.filter(doc => doc.status === filters.status);
    }
    return result;
  }, [allDocuments, filters]);

  console.log("DocumentList - Documents:", filteredDocuments);
  console.log("DocumentList - Loading:", isLoading);
  console.log("DocumentList - Error:", error);

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

  const getDocumentType = (type: string) => {
    return t(`types.${type}`, { defaultValue: type });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('list.title', { defaultValue: 'Belge Listesi' })}</CardTitle>
          <CardDescription>
            {t('list.description')}
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
          <CardTitle>{t('list.title', { defaultValue: 'Belge Listesi' })}</CardTitle>
          <CardDescription>
            {t('list.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('list.error.title')}</h3>
            <p className="text-muted-foreground">
              {t('list.error.description')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredDocuments || filteredDocuments.length === 0) {
    console.log("No documents found. Current documents:", filteredDocuments);
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('list.title', { defaultValue: 'Belge Listesi' })}</CardTitle>
          <CardDescription>
            {t('list.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('list.empty.title')}</h3>
            <p className="text-muted-foreground">
              {t('list.empty.description')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.document')}</TableHead>
              <TableHead>{t('table.type')}</TableHead>
              <TableHead>{t('table.applicationDate')}</TableHead>
              <TableHead>{t('table.updateDate')}</TableHead>
              <TableHead>{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((doc) => (
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
                <TableCell>
                  {t(`types.${doc.type}`, { defaultValue: doc.type })}
                </TableCell>
                <TableCell>
                  {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t('actions.title')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('actions.title')}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          {t('actions.view')}
                        </Link>
                      </DropdownMenuItem>
                      {doc.status === "rejected" && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/documents/${doc.id}/reupload`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t('actions.download')}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/documents/${doc.id}/history`}>
                          <History className="h-4 w-4 mr-2" />
                          {t('actions.history')}
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