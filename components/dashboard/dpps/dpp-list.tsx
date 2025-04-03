"use client";

import { Eye, MoreHorizontal, QrCode } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

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
import { cn } from "@/lib/utils";
import { useDPPs } from "@/lib/hooks/use-dpps";

interface DPP {
  id: string;
  serial_number: string;
  product_name: string;
  manufacturing_date: string;
  manufacturing_facility: string;
}

interface DPPListProps {
  dpps: DPP[];
  isLoading?: boolean;
  error?: string | null;
}

export function DPPList({ dpps = [], isLoading, error }: DPPListProps) {
  const t = useTranslations("dpp");

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="block h-4 w-[200px] animate-pulse rounded-md bg-muted" />
          </CardTitle>
          <CardDescription>
            <span className="block h-4 w-[300px] animate-pulse rounded-md bg-muted" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("list.title")}</CardTitle>
        <CardDescription>
          {t("list.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("list.serialNumber")}</TableHead>
              <TableHead>{t("list.product")}</TableHead>
              <TableHead>{t("list.manufacturingDate")}</TableHead>
              <TableHead>{t("list.facility")}</TableHead>
              <TableHead>{t("list.actions.title")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dpps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {t("list.noResults")}
                </TableCell>
              </TableRow>
            ) : (
              dpps.map((dpp) => (
                <TableRow key={dpp.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      <span>{dpp.serial_number}</span>
                    </div>
                  </TableCell>
                  <TableCell>{dpp.product_name}</TableCell>
                  <TableCell>
                    {new Date(dpp.manufacturing_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{dpp.manufacturing_facility}</TableCell>
                  <TableCell>
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
                          <Link href={`/dashboard/dpps/${dpp.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("list.actions.view")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <QrCode className="h-4 w-4 mr-2" />
                          {t("list.actions.download")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}