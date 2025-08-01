"use client";

import { Battery, MoreHorizontal, FileText, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/hooks/use-auth";
import { companyApiHooks, useDeleteCompanyDocument } from "@/lib/hooks/use-company";
import { CertificateType } from "@/lib/types/document";

import { getStatusIcon } from "../../../lib/utils/document-utils";

// Sertifika tipleri
const CERTIFICATE_TYPES = [
  'quality_certificate',
  'safety_certificate',
  'environmental_certificate',
  'iso_certificate',
  'export_certificate',
  'production_permit',  // Üretim İzni
  'activity_permit'  // Faaliyet İzni (sertifika)
] as const;

interface CompanyDocument {
  id: string;
  companyId: string;
  type: string;
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
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const manufacturerId = searchParams.get('manufacturer');
  const isViewingManufacturer = !!manufacturerId;
  const companyId = manufacturerId || user?.user_metadata?.company_id || company?.id;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const { data: allDocuments, isLoading, error } = companyApiHooks.useGetCompanyDocumentsQuery(
    { companyId },
    { enabled: !!companyId }
  );

  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteCompanyDocument();

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
              title: t('list.delete.success.title'),
              description: t('list.delete.success.description'),
            });
            setDeleteDialogOpen(false);
            setDocumentToDelete(null);
          },
          onError: (error) => {
            toast({
              title: t('list.delete.error.title'),
              description: error instanceof Error ? error.message : t('list.delete.error.generic'),
              variant: "destructive",
            });
          }
        }
      );
    }
  };
  
  // Sadece sertifika tiplerini filtrele
  const filteredDocuments = allDocuments?.filter(doc => {
    const isCertificate = CERTIFICATE_TYPES.includes(doc.type as CertificateType);
    const typeMatch = filters.type === "all" || doc.type === filters.type;
    const statusMatch = filters.status === "all-status" || doc.status === filters.status;
    return isCertificate && typeMatch && statusMatch;
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
      case 'quality_certificate':
        return 'Kalite Sertifikası';
      case 'safety_certificate':
        return 'Güvenlik Sertifikası';
      case 'environmental_certificate':
        return 'Çevre Sertifikası';
      case 'iso_certificate':
        return 'ISO Sertifikası';
      case 'export_certificate':
        return 'İhracat Sertifikası';
      case 'production_permit':
        return 'Üretim İzni';
      case 'activity_permit':
        return 'Faaliyet İzni';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('list.title')}</CardTitle>
              <CardDescription>
                {t('list.description')}
              </CardDescription>
            </div>
            {!isViewingManufacturer && (
              <Button asChild>
                <Link href="/dashboard/certifications/new">
                  {t('list.empty.upload')}
                </Link>
              </Button>
            )}
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('list.title')}</CardTitle>
              <CardDescription>
                {t('list.description')}
              </CardDescription>
            </div>
            {!isViewingManufacturer && (
              <Button asChild>
                <Link href="/dashboard/certifications/new">
                  {t('list.empty.upload')}
                </Link>
              </Button>
            )}
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('list.title')}</CardTitle>
              <CardDescription>
                {t('list.description')}
              </CardDescription>
            </div>
            {!isViewingManufacturer && (
              <Button asChild>
                <Link href="/dashboard/certifications/new">
                  {t('list.empty.upload')}
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {isViewingManufacturer ? (
              <p>{t('list.empty.manufacturer')}</p>
            ) : (
              <>
                <p>{t('list.empty.title')}</p>
                <p className="mt-2">{t('list.empty.description')}</p>
              </>
            )}
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
            <DialogTitle>{t('list.delete.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('list.delete.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('list.delete.dialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? t('list.delete.dialog.deleting') : t('list.delete.dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('list.title')}</CardTitle>
            <CardDescription>
              {t('list.description')}
            </CardDescription>
          </div>
          {!isViewingManufacturer && (
                          <Button asChild>
                <Link href="/dashboard/certifications/new">
                  {t('list.empty.upload')}
                </Link>
              </Button>
          )}
        </div>
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
              <TableRow 
                key={doc.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => window.location.href = `/dashboard/certifications/${doc.id}`}
              >
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
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/dashboard/certifications/${doc.id}`}>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {t('list.actions.view')}
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          openDeleteDialog(doc.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('list.actions.delete')}
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