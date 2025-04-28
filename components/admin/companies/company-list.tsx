"use client";

import { Building2, Package, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { companyApiHooks } from "../../../lib/hooks/use-company";
import { Company, CompanyStatus } from "../../../lib/types/company";



const getStatusBadgeVariant = (status: CompanyStatus) => {
  switch (status) {
    case CompanyStatus.ACTIVE:
      return "success";
    case CompanyStatus.INACTIVE:
      return "secondary";
    case CompanyStatus.PENDING:
      return "warning";
    default:
      return "secondary";
  }
};

export function CompanyList() {
  const { data: companies = [], isLoading, error } = companyApiHooks.useGetCompaniesQuery({}, {
    retry: false
  });
  const t = useTranslations("admin.companies");

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("list.error.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("list.error.description")}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("list.loading.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("list.loading.description")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("list.title")}</CardTitle>
          <Button variant="outline" size="sm">
            <Building2 className="mr-2 h-4 w-4" />
            {t("list.total", { count: companies.length })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("list.columns.name")}</TableHead>
              <TableHead>{t("list.columns.type")}</TableHead>
              <TableHead>{t("list.columns.email")}</TableHead>
              <TableHead>{t("list.columns.phone")}</TableHead>
              <TableHead>{t("list.columns.taxNumber")}</TableHead>
              <TableHead>{t("list.columns.status")}</TableHead>
              <TableHead>{t("list.columns.products")}</TableHead>
              <TableHead className="text-right">{t("list.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company: Company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{company.name}</span>
                  </div>
                </TableCell>
                <TableCell>{t(`types.${company.companyType.toLowerCase()}`)}</TableCell>
                <TableCell>{company.email || "-"}</TableCell>
                <TableCell>{company.phone || "-"}</TableCell>
                <TableCell>{company.taxInfo.taxNumber}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(company.status)}>
                    {t(`status.${company.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/companies/${company.id}?tab=products`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Package className="h-4 w-4" />
                    <span>{t("list.actions.viewProducts")}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t("list.actions.title")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("list.actions.title")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/companies/${company.id}`}>
                          {t("list.actions.viewDetails")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/companies/${company.id}?tab=products`}>
                          {t("list.actions.viewProducts")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/companies/${company.id}?tab=documents`}>
                          {t("list.actions.viewDocuments")}
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