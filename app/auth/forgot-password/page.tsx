"use client";

import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function ForgotPasswordContent() {
  const t = useTranslations("auth.forgot-password");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot-password");

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <KeyRound className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">{t("pageTitle")}</h1>
        <p className="text-muted-foreground">
          {t("pageDescription")}
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle> {t("title")}</CardTitle>
            </CardHeader>
          </Card>
        }
      >
        <ForgotPasswordContent />
      </Suspense>
    </div>
  );
}
