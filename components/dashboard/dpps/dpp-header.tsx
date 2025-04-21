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

export function DPPHeader() {
  const t = useTranslations("dpp");

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
            <SelectValue placeholder={t("list.filters.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("list.filters.all")}</SelectItem>
            <SelectItem value="agm">{t("list.filters.agm")}</SelectItem>
            <SelectItem value="efb">{t("list.filters.efb")}</SelectItem>
            <SelectItem value="standard">{t("list.filters.standard")}</SelectItem>
            <SelectItem value="marine">{t("list.filters.marine")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" title={t("list.actions.download")}>
          <Download className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="/dashboard/dpps/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("new.title")}
          </Link>
        </Button>
      </div>
    </div>
  );
}