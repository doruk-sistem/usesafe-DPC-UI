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
import { useDPPs } from "@/lib/hooks/use-dpps";

export function DPPList() {
  const { dpps, isLoading, error } = useDPPs();
  const t = useTranslations();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dpp.list.title")}</CardTitle>
        <CardDescription>
          {t("dpp.list.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dpp.list.columns.serialNumber")}</TableHead>
              <TableHead>{t("dpp.list.columns.product")}</TableHead>
              <TableHead>{t("dpp.list.columns.manufacturingDate")}</TableHead>
              <TableHead>{t("dpp.list.columns.facility")}</TableHead>
              <TableHead>{t("dpp.list.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dpps.map((dpp) => (
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
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/dpps/${dpp.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Download QR Code</DropdownMenuItem>
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