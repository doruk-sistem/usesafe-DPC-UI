"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const { updatePassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const t = useTranslations("auth.reset-password");
  
  // URL'den hata parametrelerini kontrol et
  useEffect(() => {
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (error && errorCode === 'otp_expired') {
      setErrorMessage(t("error.expiredLink"));
    } else if (error) {
      setErrorMessage(errorDescription || t("error.generic"));
    }
  }, [searchParams, t]);

  // Zod şemasını component içinde tanımlıyoruz
  const resetPasswordSchema = z
    .object({
      password: z
        .string()
        .min(6, t("validation.minLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

  type FormData = z.infer<typeof resetPasswordSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      await updatePassword(data.password);

      // Oturumu yenile
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        throw new Error('Oturum bulunamadı');
      }

      // Oturumu yeniden ayarla
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });

      toast({
        title: t("success.title"),
        description: t("success.description"),
      });

      // Dashboard'a yönlendir
      window.location.href = "https://app.usesafe.net/dashboard";
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: t("error.title"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("error.title"),
          description: t("error.generic"),
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <KeyRound className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">{t("pageTitle")}</h1>
        <p className="text-muted-foreground">
          {t("pageDescription")}
        </p>
      </div>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("error.title")}</CardTitle>
            <CardDescription>
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {t("error.description")}
              </p>
              <Button asChild>
                <Link href="/auth/forgot-password">
                  {t("error.requestNew")}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/login">
                  {t("error.backToLogin")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t("description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("newPassword")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          autoComplete="new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("confirmPassword")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          autoComplete="new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t("submitting") : t("submit")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
