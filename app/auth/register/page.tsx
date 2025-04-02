"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const t = useTranslations("registration");
  const { signUp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await signUp(data.email, data.password, {
        role: "manufacturer",
        full_name: data.name,
        company_id: "temp"
      });
      toast({
        title: t("form.success.title"),
        description: t("form.success.description"),
      });

      router.push("/auth/login");
    } catch (error) {
      console.error(error);
      toast({
        title: t("form.error.title"),
        description: t("form.error.description"),
      });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">{t("title")}</h1>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.ownerInfo.fullName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("form.placeholders.fullName")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.ownerInfo.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("form.placeholders.email")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.ownerInfo.password")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t("form.placeholders.password")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                {t("form.buttons.submit")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            {t("form.login.haveAccount")}{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              {t("form.login.loginLink")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
