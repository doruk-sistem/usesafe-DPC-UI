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
import type { Company } from "@/lib/types/company";
import { productService } from "@/lib/services/product";
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
        // 1. Tüm ürünlerden manufacturer_id'leri çek (tekrarsız)
        const { data: productManufacturers, error: prodErr } = await supabase
          .from("products")
          .select("manufacturer_id")
          .not("manufacturer_id", "is", null);
        if (prodErr) throw prodErr;
        const uniqueManufacturerIds = Array.from(
          new Set((productManufacturers || []).map((p) => p.manufacturer_id))
        ).filter(Boolean);
        if (uniqueManufacturerIds.length === 0) {
          setManufacturers([]);
          setIsLoading(false);
          return;
        }
        // 2. Bu id'lere sahip firmaları getir
        const { data: manufacturersData, error: manuErr } = await supabase
          .from("companies")
          .select("id, name, taxInfo, companyType, status, createdAt")
          .in("id", uniqueManufacturerIds)
          .eq("companyType", "manufacturer")
          .order("createdAt", { ascending: false });
        if (manuErr) throw manuErr;
        setManufacturers(manufacturersData || []);
        // Ürün ve belge sayıları
        const productCountPromises = (manufacturersData || []).map(async (manufacturer) => {
          const products = await productService.getProducts({ manufacturerId: manufacturer.id });
          
          // Get company document count
          const { data: companyDocs, error: docError } = await supabase
            .from("company_documents")
            .select("id")
            .eq("companyId", manufacturer.id)
            .not("filePath", "is", null);

          if (docError) {
            console.error("Error fetching company documents:", docError);
            return { id: manufacturer.id, productCount: products.length, documentCount: 0 };
          }

          const documentCount = companyDocs?.length || 0;
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
                          {t("list.actions.view")}
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