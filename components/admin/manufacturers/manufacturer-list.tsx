"use client";

import { MoreHorizontal, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
import { companyService } from "@/lib/services/company";
import type { Company } from "@/lib/types/company";
import { productService } from "@/lib/services/product";
import { DocumentService } from "@/lib/services/document";
import { supabase } from "@/lib/supabase/client";

export function ManufacturerList() {
  const t = useTranslations("adminDashboard.manufacturers");
  const [manufacturers, setManufacturers] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productCounts, setProductCounts] = useState<{ [id: string]: number }>({});
  const [documentCounts, setDocumentCounts] = useState<{ [id: string]: number }>({});
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(manufacturers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedManufacturers = manufacturers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const results = await companyService.searchManufacturers("");
        setManufacturers(results);
        // Fetch product and document counts for each manufacturer
        const productCountPromises = results.map(async (manufacturer) => {
          const products = await productService.getProducts({ manufacturerId: manufacturer.id });
          // Document count: sum all document arrays in all products
          const documentCount = products.reduce((acc, product) => {
            if (product.documents && typeof product.documents === 'object') {
              return acc + Object.values(product.documents).flat().length;
            }
            return acc;
          }, 0);
          return { id: manufacturer.id, productCount: products.length, documentCount };
        });
        const countsArr = await Promise.all(productCountPromises);
        setProductCounts(Object.fromEntries(countsArr.map(x => [x.id, x.productCount])));
        setDocumentCounts(Object.fromEntries(countsArr.map(x => [x.id, x.documentCount])));
      } catch (error) {
        console.error("Error fetching manufacturers or counts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchManufacturers();
  }, []);

  function mapStatus(status: any) {
    if (status === true) return "approved";
    if (status === false) return "pending"; // veya "rejected"
    return status;
  }

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("list.title")}</CardTitle>
          <CardDescription>{t("list.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (manufacturers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("list.title")}</CardTitle>
          <CardDescription>{t("list.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <span className="text-sm text-muted-foreground">No manufacturers found.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("list.title")}</CardTitle>
        <CardDescription>{t("list.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("list.columns.company")}</TableHead>
              <TableHead>{t("list.columns.products")}</TableHead>
              <TableHead>{t("list.columns.documents")}</TableHead>
              <TableHead>{t("list.columns.date")}</TableHead>
              <TableHead>{t("list.columns.status")}</TableHead>
              <TableHead>{t("list.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedManufacturers.map((manufacturer) => (
              <TableRow key={manufacturer.id}>
                <TableCell>
                  <p className="font-medium">{manufacturer.name}</p>
                  {manufacturer.taxInfo?.taxNumber && (
                    <p className="text-sm text-muted-foreground">
                      {manufacturer.taxInfo.taxNumber}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {productCounts[manufacturer.id] ?? '-'}
                </TableCell>
                <TableCell>
                  {documentCounts[manufacturer.id] ?? '-'}
                </TableCell>
                <TableCell>
                  {manufacturer.createdAt
                    ? new Date(manufacturer.createdAt).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      mapStatus(manufacturer.status) === "approved"
                        ? "success"
                        : mapStatus(manufacturer.status) === "rejected"
                        ? "destructive"
                        : "warning"
                    }
                    className="flex w-fit items-center gap-1"
                  >
                    {mapStatus(manufacturer.status) === "approved" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : mapStatus(manufacturer.status) === "rejected" ? (
                      <XCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {t(`list.status.${mapStatus(manufacturer.status)}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t("list.columns.actions")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("list.columns.actions")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/manufacturers/${manufacturer.id}`}>
                          {t("list.actions.viewDetails")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/documents?manufacturer=${manufacturer.id}`}>
                          {t("list.actions.reviewDocuments")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/manufacturers/${manufacturer.id}?tab=products`}>
                          {t("list.actions.viewProducts")}
                        </Link>
                      </DropdownMenuItem>
                      {mapStatus(manufacturer.status) === "pending" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-green-600">
                            {t("list.actions.approve")}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            {t("list.actions.reject")}
                          </DropdownMenuItem>
                        </>
                      )}
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