"use client";

import { FileText, MoreHorizontal, Download, History, ExternalLink, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { getStatusIcon } from "../../../lib/utils/document-utils";

export function DocumentList() {
  const t = useTranslations();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "expiring":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("documents.repository.title")}</CardTitle>
        <CardDescription>
          {t("documents.repository.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("documents.repository.columns.document")}</TableHead>
              <TableHead>{t("documents.repository.columns.type")}</TableHead>
              <TableHead>{t("documents.repository.columns.category")}</TableHead>
              <TableHead>{t("documents.repository.columns.status")}</TableHead>
              <TableHead>{t("documents.repository.columns.validUntil")}</TableHead>
              <TableHead>{t("documents.repository.columns.issuer")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Remove sample/mock documents array and use real API/hook data here */}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}