"use client";

import { useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/lib/hooks/use-auth";

import { ManufacturerSearch } from "./manufacturerSearch/ManufacturerSearch";

interface ManufacturerSelectProps {
  form: any;
  companyType: string | null;
}

export function ManufacturerSelect({
  form,
  companyType,
}: ManufacturerSelectProps) {
  const { user } = useAuth();

  // Set manufacturer_id automatically if user is a manufacturer
  useEffect(() => {
    if (companyType !== "brand_owner" && user?.user_metadata?.company_id) {
      form.setValue("manufacturer_id", user.user_metadata.company_id);
    }
  }, [companyType, user, form]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Select Manufacturer</h3>
            <p className="text-sm text-muted-foreground">
              {companyType === "brand_owner"
                ? "Search and select the manufacturer for this product"
                : "You are registered as a manufacturer. This step is for brand owners only."}
            </p>
          </div>

          {companyType === "brand_owner" ? (
            <FormField
              control={form.control}
              name="manufacturer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer *</FormLabel>
                  <FormControl>
                    <ManufacturerSearch
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-muted-foreground">
                As a manufacturer, you can proceed to the next step. Your
                company will automatically be set as the manufacturer.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
