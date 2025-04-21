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

export function ManufacturerHeader() {
  const t = useTranslations("adminDashboard.manufacturers");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t("list.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("list.description")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allManufacturers")}</SelectItem>
            <SelectItem value="pending">{t("filters.pendingApproval")}</SelectItem>
            <SelectItem value="approved">{t("filters.approved")}</SelectItem>
            <SelectItem value="rejected">{t("filters.rejected")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="/admin/manufacturers/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.addNew")}
          </Link>
        </Button>
      </div>
    </div>
  );
}