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

export function CertificationHeader() {
  const t = useTranslations();
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t("dpc.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("dpc.description")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("dpc.applications.filters.allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dpc.applications.filters.allTypes")}</SelectItem>
            <SelectItem value="agm">{t("dpc.applications.types.agm")}</SelectItem>
            <SelectItem value="efb">{t("dpc.applications.types.efb")}</SelectItem>
            <SelectItem value="standard">{t("dpc.applications.types.standard")}</SelectItem>
            <SelectItem value="marine">{t("dpc.applications.types.marine")}</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all-status">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("dpc.applications.filters.allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">{t("dpc.applications.filters.allStatus")}</SelectItem>
            <SelectItem value="pending">{t("dpc.applications.status.pending")}</SelectItem>
            <SelectItem value="approved">{t("dpc.applications.status.approved")}</SelectItem>
            <SelectItem value="rejected">{t("dpc.applications.status.rejected")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="/dashboard/certifications/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("dpc.applications.actions.newDPC")}
          </Link>
        </Button>
      </div>
    </div>
  );
}