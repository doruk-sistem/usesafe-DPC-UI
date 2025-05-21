"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { supabase } from "@/lib/supabase/client";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Şifre en az 6 karakter olmalıdır"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // URL'den hata parametrelerini kontrol et
  useEffect(() => {
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (error && errorCode === 'otp_expired') {
      setErrorMessage('Şifre sıfırlama bağlantısının süresi dolmuş. Lütfen yeni bir şifre sıfırlama bağlantısı talep edin.');
    } else if (error) {
      setErrorMessage(errorDescription || 'Şifre sıfırlama işlemi sırasında bir hata oluştu.');
    }
  }, [searchParams]);

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
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      toast({
        title: "Şifre Başarıyla Sıfırlandı",
        description: "Yeni şifrenizle giriş yapabilirsiniz.",
      });

      router.push("/auth/login");
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

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <KeyRound className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Yeni Şifre Oluştur</h1>
        <p className="text-muted-foreground">
          Hesabınız için güçlü bir şifre belirleyin
        </p>
      </div>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Hata</CardTitle>
            <CardDescription>
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Şifre sıfırlama bağlantınızın süresi dolmuş olabilir. Yeni bir şifre sıfırlama bağlantısı talep etmek için aşağıdaki butona tıklayın.
              </p>
              <Button asChild>
                <Link href="/auth/forgot-password">
                  Yeni Şifre Sıfırlama Bağlantısı Talep Et
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/login">
                  Giriş Sayfasına Dön
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Şifre Sıfırlama</CardTitle>
            <CardDescription>
              Lütfen yeni şifrenizi girin
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
                      <FormLabel>Yeni Şifre</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
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
                      <FormLabel>Şifreyi Tekrar Girin</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "İşleniyor..." : "Şifreyi Sıfırla"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
