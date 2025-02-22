"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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

export function DPPForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { products } = useProducts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id: "",
      serial_number: "",
      manufacturing_date: new Date().toISOString().split("T")[0],
      manufacturing_facility: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!values.product_id) {
        throw new Error("Please select a product");
      }

      const {
        product_id,
        serial_number,
        manufacturing_date,
        manufacturing_facility,
      } = values;
      await DPPService.createDPP({
        product_id,
        serial_number,
        manufacturing_date,
        manufacturing_facility,
      });

      toast({
        title: "Success",
        description: "DPP created successfully",
      });

      router.push("/dashboard/dpps");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create DPP",
        variant: "destructive",
      });
      console.error("DPP creation error:", error);
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
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
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
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter serial number" {...field} />
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
              <FormLabel>Manufacturing Date</FormLabel>
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
              <FormLabel>Manufacturing Facility</FormLabel>
              <FormControl>
                <Input placeholder="Enter facility name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Create DPP</Button>
        </div>
      </form>
    </Form>
  );
}
