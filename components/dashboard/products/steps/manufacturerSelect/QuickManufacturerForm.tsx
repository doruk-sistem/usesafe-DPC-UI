"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { CompanyService } from "@/lib/services/company";
import { Company, CompanyType } from "@/lib/types/company";

const formSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  taxNumber: z.string()
    .length(10, "Tax ID must be exactly 10 digits")
    .regex(/^\d+$/, "Tax ID must contain only numbers"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  contactEmail: z.string()
    .email("Invalid email address")
    .refine((email) => {
      const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const domain = email.split('@')[1];
      return !freeEmailProviders.includes(domain);
    }, {
      message: "Please use a corporate email address"
    }),
});

type FormData = z.infer<typeof formSchema>;

interface QuickManufacturerFormProps {
  onSuccess: (manufacturer: Company) => void;
  onCancel: () => void;
}

export function QuickManufacturerForm({ onSuccess, onCancel }: QuickManufacturerFormProps) {
  const { toast } = useToast();
  const {company: mainCompany} = useAuth();
  const t = useTranslations("productManagement.addProduct.form.fields.manufacturer");
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      taxNumber: "",
      contactName: "",
      contactEmail: "",
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const data: FormData = form.getValues()
    
    try {
      const company = {
        name: data.name,
        taxInfo: {
          taxNumber: data.taxNumber,
        },
        companyType: "manufacturer",
        contact: {
          name: data.contactName,
          email: data.contactEmail,
        }
      }

      const response = await CompanyService.createManufacturer(company, mainCompany);

      if (response.success) {
        toast({
          title: "Success",
          description: "Manufacturer created successfully and pending approval",
        });
        onSuccess({
          ...company,
          id: response.companyId,
          status: false
        });
      } else {
        throw new Error(response.message || "Failed to create manufacturer");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create manufacturer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("companyName")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("taxId")}</FormLabel>
              <FormControl>
                <Input {...field} maxLength={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("contactPerson")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("contactEmail")}</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button onClick={(e) => handleSubmit(e)}>
            {t("create")}
          </Button>
        </div>
      </Form>
    </div>
  );
}