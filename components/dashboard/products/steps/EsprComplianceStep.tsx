"use client";

import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { NewProduct } from "@/lib/types/product";

interface EsprComplianceStepProps {
  form: UseFormReturn<NewProduct>;
}

export function EsprComplianceStep({ form }: EsprComplianceStepProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleEsprCheck = async () => {
    try {
      setIsLoading(true);
      const formData = form.getValues();
      
      // For new products, we'll use a temporary endpoint
      const endpoint = formData.id 
        ? `/api/products/espr-compliance/${formData.id}`
        : '/api/products/espr-compliance/check';

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName: formData.name,
          categoryName: formData.product_type,
          regions: ["eu", "uk"], // Default to EU and UK
        }),
      });

      if (!response.ok) {
        throw new Error("ESPR compliance check failed");
      }

      const data = await response.json();
      
      // Save ESPR compliance data to form state
      form.setValue("espr_compliance", {
        directives: data.directives,
        regulations: data.regulations,
        standards: data.standards,
      });

      toast({
        title: "Success",
        description: "ESPR compliance check completed successfully",
      });
    } catch (error) {
      console.error("ESPR check error:", error);
      toast({
        title: "Error",
        description: "Failed to check ESPR compliance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">ESPR Compliance</h3>
        <p className="text-sm text-muted-foreground">
          Check your product's compliance with the Ecodesign for Sustainable Products Regulation (ESPR)
        </p>
      </div>

      <div className="space-y-4">
        <Button
          type="button"
          onClick={handleEsprCheck}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Checking..." : "Check ESPR Compliance"}
        </Button>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="espr_compliance.directives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ESPR Directives</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="ESPR directives will appear here..."
                    value={JSON.stringify(field.value, null, 2)}
                    readOnly
                    className="h-32"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="espr_compliance.regulations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ESPR Regulations</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="ESPR regulations will appear here..."
                    value={JSON.stringify(field.value, null, 2)}
                    readOnly
                    className="h-32"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="espr_compliance.standards"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ESPR Standards</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="ESPR standards will appear here..."
                    value={JSON.stringify(field.value, null, 2)}
                    readOnly
                    className="h-32"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
} 