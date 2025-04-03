"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ManufacturerSearch } from "./manufacturerSearch/ManufacturerSearch";

interface ManufacturerSelectProps {
  form: any;
}

export function ManufacturerSelect({
  form,
}: ManufacturerSelectProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Select Manufacturer</h3>
            <p className="text-sm text-muted-foreground">
              Search and select the manufacturer for this product
            </p>
          </div>

          <FormField
            control={form.control}
            name="manufacturer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer</FormLabel>
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
        </div>
      </CardContent>
    </Card>
  );
}
