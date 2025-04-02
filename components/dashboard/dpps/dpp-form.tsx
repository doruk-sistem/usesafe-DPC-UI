"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTranslations } from "next-intl";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProducts } from "@/lib/hooks/use-products";
import { DPPService } from "@/lib/services/dpp";

const formSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  serial_number: z.string().min(1, "Serial number is required"),
  manufacturing_date: z.string().min(1, "Manufacturing date is required"),
  manufacturing_facility: z
    .string()
    .min(1, "Manufacturing facility is required"),
});

type FormData = z.infer<typeof formSchema>;

export function DPPForm() {
  const { user, company } = useAuth();
  const { products } = useProducts();
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("dpp.new");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id: "",
      serial_number: "",
      manufacturing_date: "",
      manufacturing_facility: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.id || !company?.id) return;

    try {
      await DPPService.createDPP({
        ...data,
      });

      toast({
        title: t("success.title"),
        description: t("success.description"),
      });

      router.push("/dashboard/dpps");
    } catch (error) {
      console.error("Error creating DPP:", error);
      toast({
        title: t("error.title"),
        description: t("error.description"),
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="product_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.product.label")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.product.placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serial_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.serialNumber.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form.serialNumber.placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manufacturing_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.manufacturingDate.label")}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manufacturing_facility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.facility.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form.facility.placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {t("new.title")}
        </Button>
      </form>
    </Form>
  );
}
