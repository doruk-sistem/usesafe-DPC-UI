"use client";

import { Building2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

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
import { useCompanies } from "@/lib/hooks/use-company";
import { Company } from "@/lib/types/company";

export function CompanyList() {
  const { companies, isLoading, error } = useCompanies();
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
              <TableHead>{t("list.columns.taxNumber")}</TableHead>
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
                <TableCell>{company.taxInfo.taxNumber}</TableCell>
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