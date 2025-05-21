"use client";

import { KeyRound } from "lucide-react";
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Şifremi Unuttum</CardTitle>
        <CardDescription>
          Şifrenizi sıfırlamak için e-posta adresinizi girin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <KeyRound className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Şifre Sıfırlama</h1>
        <p className="text-muted-foreground">
          Hesabınıza erişiminizi yeniden kazanın
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Yükleniyor...</CardTitle>
            </CardHeader>
          </Card>
        }
      >
        <ForgotPasswordContent />
      </Suspense>
    </div>
  );
}
