"use client";

import { Download, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DocumentHeader() {
  const t = useTranslations();
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t("companyDocuments.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("companyDocuments.description")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("documents.repository.filters.allDocuments")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("documents.repository.filters.allDocuments")}</SelectItem>
            <SelectItem value="quality">{t("documents.types.qualityManagement")}</SelectItem>
            <SelectItem value="safety">{t("documents.types.safetyHealth")}</SelectItem>
            <SelectItem value="battery">{t("documents.types.batteryStandards")}</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all-status">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("documents.repository.filters.allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">{t("documents.repository.filters.allStatus")}</SelectItem>
            <SelectItem value="pending">{t("documents.repository.status.pending")}</SelectItem>
            <SelectItem value="approved">{t("documents.repository.status.approved")}</SelectItem>
            <SelectItem value="rejected">{t("documents.repository.status.rejected")}</SelectItem>
            <SelectItem value="expired">{t("documents.repository.status.expired")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="/dashboard/documents/upload">
            <Plus className="h-4 w-4 mr-2" />
            {t("documents.repository.actions.upload")}
          </Link>
        </Button>
      </div>
    </div>
  );
}