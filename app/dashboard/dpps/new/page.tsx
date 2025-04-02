"use client";

import { useTranslations } from "next-intl";

import { DPPForm } from "@/components/dashboard/dpps/dpp-form";
import { Card } from "@/components/ui/card";

export default function NewDPPPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("dpp.create.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("dpp.create.description")}
        </p>
      </div>

      <Card className="p-6">
        <DPPForm />
      </Card>
    </div>
  );
}