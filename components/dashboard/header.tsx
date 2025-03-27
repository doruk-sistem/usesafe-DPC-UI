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

export function DashboardHeader() {
  const t = useTranslations("dashboard");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t("overview.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("overview.description")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue="today">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("period.select")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{t("period.today")}</SelectItem>
            <SelectItem value="week">{t("period.thisWeek")}</SelectItem>
            <SelectItem value="month">{t("period.thisMonth")}</SelectItem>
            <SelectItem value="quarter">{t("period.thisQuarter")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}