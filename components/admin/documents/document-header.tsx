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
  const t = useTranslations("documentManagement");
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filters.allDocuments")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allDocuments")}</SelectItem>
            <SelectItem value="certification">{t("categories.qualityManagement")}</SelectItem>
            <SelectItem value="compliance">{t("categories.safetyAndHealth")}</SelectItem>
            <SelectItem value="legal">{t("categories.batteryStandards")}</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all-status">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filters.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">{t("filters.allStatuses")}</SelectItem>
            <SelectItem value="pending">{t("status.pending")}</SelectItem>
            <SelectItem value="approved">{t("status.approved")}</SelectItem>
            <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
            <SelectItem value="expired">{t("status.expiringSoon")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button>
          <Link href="/admin/documents/upload">
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.upload")}
          </Link>
        </Button>
      </div>
    </div>
  );
}