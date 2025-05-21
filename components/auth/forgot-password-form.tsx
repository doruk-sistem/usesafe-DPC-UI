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

const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
});

type FormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
        title: "Şifre Sıfırlama Bağlantısı Gönderildi",
        description: "E-posta adresinize şifre sıfırlama bağlantısı gönderdik.",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Şifre Sıfırlama Başarısız",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Şifre Sıfırlama Başarısız",
          description: "Beklenmeyen bir hata oluştu",
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
        <h3 className="text-lg font-medium">Şifre Sıfırlama Bağlantısı Gönderildi</h3>
        <p className="text-muted-foreground">
          E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Lütfen gelen kutunuzu kontrol edin.
        </p>
        <Button asChild className="mt-4">
          <Link href="/auth/login">Giriş Sayfasına Dön</Link>
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
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ornek@sirket.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
          </Button>

          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              Şifrenizi hatırladınız mı?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Giriş yap
              </Link>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
