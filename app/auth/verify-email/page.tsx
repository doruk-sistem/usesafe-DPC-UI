"use client";

import { CheckCircle2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const t = useTranslations("auth.verifyEmail");

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
              <Mail className="h-5 w-5 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">{t("emailSent.title")}</p>
                <p className="text-blue-600">{t("emailSent.description")}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">{t("nextSteps.title")}</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>{t("nextSteps.verifyEmail")}</li>
                <li>{t("nextSteps.onboarding")}</li>
              </ol>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                {t("helpText")}
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                {t("actions.login")}
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("actions.backToHome")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 