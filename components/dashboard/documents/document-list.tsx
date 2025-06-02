"use client";

import { FileText, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { DocumentType } from "@/lib/types/document";


// Döküman tipleri
const DOCUMENT_TYPES = [
  'signature_circular',
  'trade_registry_gazette',
  'tax_plate',
  'activity_certificate'
] as const;

export function DocumentList({ filters }: { filters: { type: string; status: string } }) {
  const t = useTranslations('documents');
  const { useGetCompanyDocuments } = useCompanyDocuments();
  const { data: allDocuments, isLoading, error } = useGetCompanyDocuments();

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
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
          <CardTitle>{t('list.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {t('list.error')}
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
              <TableRow 
                key={doc.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => window.location.href = `/dashboard/documents/${doc.id}`}
              >
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
                        {doc.id}
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
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t('actions.title')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          {t('actions.view')}
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