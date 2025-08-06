"use client";

import { Truck, MoreHorizontal, Box, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDistributorList, useDeleteDistributor } from "@/lib/hooks/use-distributors";
import type { Distributor } from "@/lib/types/distributor";

interface DistributorListProps {
  filters?: any;
  onAddDistributor?: () => void;
}

export function DistributorList({ filters, onAddDistributor }: DistributorListProps) {
  const { distributors, stats, isLoading, error } = useDistributorList(filters);
  const deleteDistributorMutation = useDeleteDistributor();
  const t = useTranslations("distributors");
  
  // State for delete confirmation dialog
  const [distributorToDelete, setDistributorToDelete] = useState<Distributor | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handle delete distributor
  const handleDeleteDistributor = async () => {
    if (!distributorToDelete) return;

    try {
      const result = await deleteDistributorMutation.mutateAsync({ id: distributorToDelete.id });
      
      if (result.success) {
        toast.success(t("list.deleteSuccess"));
        setIsDeleteDialogOpen(false);
        setDistributorToDelete(null);
      } else if (result.error) {
        toast.error(result.error.message);
      }
    } catch (error) {
      toast.error(t("list.deleteError"));
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (distributor: Distributor) => {
    setDistributorToDelete(distributor);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("list.title")}</CardTitle>
          <CardDescription>
            {t("list.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">{t("list.loading")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive">{t("list.error")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (distributors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("list.title")}</CardTitle>
          <CardDescription>
            {t("list.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("list.empty.title")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("list.empty.description")}
            </p>
            <Button onClick={onAddDistributor}>
              <Truck className="h-4 w-4 mr-2" />
              {t("list.empty.addFirst")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "inactive":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <>
      <Card>
      <CardHeader>
        <CardTitle>{t("list.title")}</CardTitle>
        <CardDescription>
          {t("list.description")}
        </CardDescription>
        {stats && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{t("stats.total")}: {stats.total}</span>
            <span>{t("stats.withProducts")}: {stats.withProducts || 0}</span>
            <span>{t("stats.withoutProducts")}: {stats.withoutProducts || 0}</span>
            <span>{t("stats.totalProducts")}: {stats.totalProducts || 0}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("list.columns.company")}</TableHead>
              <TableHead>{t("list.columns.taxId")}</TableHead>
              <TableHead>{t("list.columns.products")}</TableHead>
              <TableHead>{t("list.columns.createdAt")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {distributors.map((distributor) => (
              <TableRow key={distributor.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{distributor.name}</p>
                      {distributor.email && (
                        <p className="text-sm text-muted-foreground">{distributor.email}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{distributor.taxInfo.taxNumber}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {distributor.assignedProducts || 0} {t("list.columns.products")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {distributor.createdAt ? formatDate(distributor.createdAt) : "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t("list.actions.more")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("list.actions.more")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/distributors/${distributor.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t("list.actions.view")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/distributors/${distributor.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t("list.actions.edit")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/distributors/${distributor.id}/products`}>
                          <Box className="h-4 w-4 mr-2" />
                          {t("list.actions.viewProducts")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => openDeleteDialog(distributor)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("list.actions.delete")}
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

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("list.deleteDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("list.deleteDialog.description", { name: distributorToDelete?.name || "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("list.deleteDialog.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteDistributor}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteDistributorMutation.isPending}
          >
            {deleteDistributorMutation.isPending ? t("list.deleteDialog.deleting") : t("list.deleteDialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
} 