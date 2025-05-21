"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTranslations } from "next-intl";

const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
});

type FormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const t = useTranslations("auth");

  const form = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await resetPassword(data.email);
      setIsSuccess(true);
      toast({
        title: t("forgot-password.success.title"),
        description: t("forgot-password.success.description"),
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: t("forgot-password.error.title"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("forgot-password.error.title"),
          description: t("forgot-password.error.description"),
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium">{t("forgot-password.success.title")}</h3>
        <div className="bg-muted p-4 rounded-lg text-left mb-4">
          <p className="text-muted-foreground mb-2">
            {t("forgot-password.success.description")}
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>{t("forgot-password.success.checkInbox")}</li>
            <li>{t("forgot-password.success.checkSpam")}</li>
            <li>{t("forgot-password.success.validityPeriod")}</li>
          </ul>
        </div>
        <Button asChild className="mt-4">
          <Link href="/auth/login">{t("forgot-password.success.button")}</Link>   
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forgot-password.email.label")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t("forgot-password.email.placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("forgot-password.submitting") : t("forgot-password.submit")}
          </Button>

          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              {t("forgot-password.reminder")}{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                {t("forgot-password.login")}
              </Link>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
