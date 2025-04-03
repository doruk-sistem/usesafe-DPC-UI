import { Save } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function SettingsHeader() {
  const t = useTranslations("settings");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          {t("saveChanges")}
        </Button>
      </div>
    </div>
  );
}