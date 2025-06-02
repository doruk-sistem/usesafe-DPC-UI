"use client";

import { Download, Plus } from "lucide-react";
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

export function CertificationHeader() {
  const t = useTranslations("admin.certifications");
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t("header.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("header.description")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filters.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filters.allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
            <SelectItem value="pending">{t("status.pending")}</SelectItem>
            <SelectItem value="approved">{t("status.approved")}</SelectItem>
            <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" title={t("actions.download")}>
          <Download className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="/admin/certifications/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.newCertification")}
          </Link>
        </Button>
      </div>
    </div>
  );
}