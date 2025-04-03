"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SupplierHeader() {
  const t = useTranslations("suppliers");

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
            <SelectValue placeholder={t("list.filters.selectType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("list.filters.allTypes")}</SelectItem>
            <SelectItem value="manufacturer">{t("list.types.manufacturer")}</SelectItem>
            <SelectItem value="distributor">{t("list.types.distributor")}</SelectItem>
            <SelectItem value="retailer">{t("list.types.retailer")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" title={t("list.actions.download")}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}