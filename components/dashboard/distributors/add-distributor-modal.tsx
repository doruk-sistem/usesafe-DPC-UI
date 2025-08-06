"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Truck, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import { DistributorService } from "@/lib/services/distributor";

// Form validation schema
const distributorSchema = z.object({
  name: z.string().min(2, "Distributor name must be at least 2 characters"),
  taxNumber: z.string().min(10, "Tax number must be at least 10 characters"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
});

type DistributorFormData = z.infer<typeof distributorSchema>;

interface AddDistributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddDistributorModal({ isOpen, onClose, onSuccess }: AddDistributorModalProps) {
  const t = useTranslations("distributors");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DistributorFormData>({
    resolver: zodResolver(distributorSchema),
    defaultValues: {
      name: "",
      taxNumber: "",
      email: "",
      phone: "",
      website: "",
      address: "",
    },
  });

  const onSubmit = async (data: DistributorFormData) => {
    try {
      setIsLoading(true);

      // Create distributor data
      const distributorData = {
        name: data.name,
        company_type: "distributor",
        tax_info: {
          taxNumber: data.taxNumber,
        },
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        address: data.address ? { headquarters: data.address } : {},
        assigned_products_count: 0,
      };

      // Insert into database
      const { error } = await DistributorService.createDistributor({ distributorData });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: "Distributor added successfully",
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to add distributor:", error);
      
      // Daha detaylı error mesajı
      let errorMessage = "Failed to add distributor";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {t("add.title")}
          </DialogTitle>
          <DialogDescription>
            {t("add.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("add.form.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("add.form.namePlaceholder")} {...field} />
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
                  <FormLabel>{t("add.form.taxNumber")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("add.form.taxNumberPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("add.form.email")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("add.form.emailPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("add.form.phone")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("add.form.phonePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("add.form.website")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("add.form.websitePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("add.form.address")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t("add.form.addressPlaceholder")} 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                {t("add.form.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? t("add.form.adding") : t("add.form.add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 