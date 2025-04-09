"use client";

import { MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

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

const manufacturers = [
  {
    id: "MFR-001",
    name: "TechFabrics Ltd",
    email: "contact@techfabrics.com",
    status: "pending",
    documents: 5,
    products: 12,
    registeredAt: "2024-03-15T10:30:00",
  },
  {
    id: "MFR-002",
    name: "EcoTextiles Co",
    email: "info@ecotextiles.com",
    status: "approved",
    documents: 8,
    products: 24,
    registeredAt: "2024-03-14T15:45:00",
  },
  {
    id: "MFR-003",
    name: "Sustainable Wear",
    email: "hello@sustainablewear.com",
    status: "rejected",
    documents: 3,
    products: 0,
    registeredAt: "2024-03-13T09:15:00",
  },
];

export function ManufacturerList() {
  const t = useTranslations("adminDashboard.manufacturers");

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
              <TableHead>ID</TableHead>
              <TableHead>{t("list.columns.company")}</TableHead>
              <TableHead>{t("list.columns.status")}</TableHead>
              <TableHead>{t("list.columns.documents")}</TableHead>
              <TableHead>{t("list.columns.products")}</TableHead>
              <TableHead>{t("list.columns.date")}</TableHead>
              <TableHead>{t("list.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manufacturers.map((manufacturer) => (
              <TableRow key={manufacturer.id}>
                <TableCell className="font-medium">
                  {manufacturer.id}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{manufacturer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {manufacturer.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      manufacturer.status === "approved"
                        ? "success"
                        : manufacturer.status === "rejected"
                        ? "destructive"
                        : "warning"
                    }
                    className="flex w-fit items-center gap-1"
                  >
                    {manufacturer.status === "approved" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : manufacturer.status === "rejected" ? (
                      <XCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {t(`list.status.${manufacturer.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>{manufacturer.documents}</TableCell>
                <TableCell>{manufacturer.products}</TableCell>
                <TableCell>
                  {new Date(manufacturer.registeredAt).toLocaleDateString()}
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
                      {manufacturer.status === "pending" && (
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
      </CardContent>
    </Card>
  );
}