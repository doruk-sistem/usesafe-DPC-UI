"use client";

import { useTranslations } from "next-intl";

export function CompanyHeader() {
  const t = useTranslations("admin.companies");

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>
    </div>
  );
}