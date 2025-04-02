import { Download, Plus, Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DPPHeader() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t("dpp.list.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("dpp.list.description")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("dpp.list.filters.type.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dpp.list.filters.type.all")}</SelectItem>
            <SelectItem value="agm">{t("dpp.applications.types.agm")}</SelectItem>
            <SelectItem value="efb">{t("dpp.applications.types.efb")}</SelectItem>
            <SelectItem value="standard">{t("dpp.applications.types.standard")}</SelectItem>
            <SelectItem value="marine">{t("dpp.applications.types.marine")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" title={t("dpp.list.actions.download")}>
          <Download className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="/dashboard/dpps/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("dpp.list.actions.create")}
          </Link>
        </Button>
      </div>
    </div>
  );
}