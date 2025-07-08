"use client";

import { Building2, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(companies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCompanies = companies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  function getPaginationRange(current: number, total: number): (number | string)[] {
    const delta = 2;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < total - 1) {
      range.push('...');
    }
    range.unshift(1);
    if (total > 1) range.push(total);
    return range;
  }

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
            {paginatedCompanies.map((company: Company) => (
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

        {/* Pagination UI */}
        {totalPages > 1 && (
          <nav className="flex justify-center items-center gap-1 mt-6 select-none" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 text-lg
                ${currentPage === 1 ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed' : 'bg-white hover:bg-muted/70 border-muted text-muted-foreground'}`}
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getPaginationRange(currentPage, totalPages).map((page, idx) =>
              typeof page === 'string'
                ? <span key={"ellipsis-"+idx} className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm">...</span>
                : <button
                    key={page}
                    onClick={() => setCurrentPage(Number(page))}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 font-medium
                      ${currentPage === page
                        ? 'bg-primary/10 text-primary border-primary font-semibold'
                        : 'bg-white text-muted-foreground border-muted hover:bg-muted/70'}
                    `}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
            )}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 text-lg
                ${currentPage === totalPages ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed' : 'bg-white hover:bg-muted/70 border-muted text-muted-foreground'}`}
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}
      </CardContent>
    </Card>
  );
}