"use client";

import { MoreHorizontal, Plus, File, CheckCircle, XCircle, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

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
import { documentsApiHooks } from "@/lib/hooks/use-documents";
const { useGetDocuments } = documentsApiHooks;

interface CompanyDocumentsProps {
  companyId: string;
}

export function CompanyDocuments({ companyId }: CompanyDocumentsProps) {
  const t = useTranslations("admin.companies.documents");
  const { data: documents, isLoading } = useGetDocuments();

  // Sadece bu şirkete ait belgeleri filtrele
  const companyDocuments = documents?.filter(doc => doc.manufacturerId === companyId) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </div>
        <Button size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          {t("actions.add")}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>{t("loading")}</div>
        ) : companyDocuments.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
              <Button variant="outline" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                {t("empty.uploadFirst")}
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.id")}</TableHead>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.type")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.uploadDate")}</TableHead>
                <TableHead>{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">{document.id}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    {document.name}
                  </TableCell>
                  <TableCell>
                    {t(`types.${document.type}`, { defaultValue: document.type })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        document.status === "approved"
                          ? "success"
                          : document.status === "rejected"
                          ? "destructive"
                          : "warning"
                      }
                      className="flex w-fit items-center gap-1"
                    >
                      {document.status === "approved" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : document.status === "rejected" ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {t(`status.${document.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t("actions.title")}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("actions.title")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>{t("actions.view")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("actions.download")}</DropdownMenuItem>
                        {document.status === "pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-green-600">
                              {t("actions.approve")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              {t("actions.reject")}
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          {t("actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}