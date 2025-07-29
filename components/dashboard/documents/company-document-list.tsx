"use client";

import { FileText, MoreHorizontal, Download, History, ExternalLink, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useDeleteDocument } from "@/lib/hooks/use-company";
import { Document } from "@/lib/types/document";
import { getStatusIcon } from "@/lib/utils/document-utils";

export function CompanyDocumentList() {
  const t = useTranslations();
  const { toast } = useToast();
  const { useGetCompanyDocuments } = useCompanyDocuments();
  const { data: documents, isLoading, error } = useGetCompanyDocuments();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

  // Silme dialog'unu aç
  const openDeleteDialog = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  // Silme işlemini onayla
  const confirmDelete = async () => {
    if (documentToDelete) {
      deleteDocument(
        { documentId: documentToDelete },
        {
          onSuccess: () => {
            toast({
              title: t('documents.delete.success.title'),
              description: t('documents.delete.success.description'),
            });
            setDeleteDialogOpen(false);
            setDocumentToDelete(null);
          },
          onError: (error) => {
            toast({
              title: t('documents.delete.error.title'),
              description: error instanceof Error ? error.message : t('documents.delete.error.generic'),
              variant: "destructive",
            });
          }
        }
      );
    }
  };

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
    <>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('documents.delete.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('documents.delete.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('documents.delete.dialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? t('documents.delete.dialog.deleting') : t('documents.delete.dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(doc.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
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
    </>
  );
} 