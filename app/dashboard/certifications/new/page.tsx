"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewDPCForm } from "../../../../components/dashboard/certifications/new-dpc-form";
import { useTranslations } from "next-intl";

export default function NewDPCPage() {
  const t = useTranslations("certifications.form");

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewDPCForm />
        </CardContent>
      </Card>
    </div>
  );
}
