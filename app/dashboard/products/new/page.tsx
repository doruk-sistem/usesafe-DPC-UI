"use client";

import { useRouter } from "next/navigation";

import { ProductForm } from "@/components/dashboard/products/product-form";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { ProductService } from "@/lib/services/product";
import { ProductStatusService } from "@/lib/services/product-status";
import { StorageService } from "@/lib/services/storage";
import type { NewProduct } from "@/lib/types/product";

export default function NewProductPage() {
  const router = useRouter();
  const { user, company } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: NewProduct) => {
    if (!user?.id) return;

    try {
      // Upload image if provided
      const uploadedImages = await Promise.all(
        data.images.map(async (image) => {
          if (image.url.startsWith('blob:')) {
            const uploadedUrl = await StorageService.uploadProductImage(image.url, company.id);
            
            if (!uploadedUrl) {
              toast({
                title: "Image Upload Error",
                description: "Failed to upload one or more images. Please try again.",
                variant: "destructive",
              });
              return null;
            }

            return {
              ...image,
              url: uploadedUrl
            };
          }
          return image;
        })
      );

      // Filter out any null images
      const validImages = uploadedImages.filter(img => img !== null);

      if (validImages.length === 0) {
        toast({
          title: "Error",
          description: "No images could be uploaded",
          variant: "destructive",
        });
        return;
      }

      // Continue with product creation using validImages
      const response = await ProductService.createProduct({
        ...data,
        images: validImages,
        company_id: company.id,
        status: "DRAFT",
        status_history: [{
          from: null,
          to: "DRAFT",
          timestamp: new Date().toISOString(),
          userId: user.id
        }]
      });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error.message,
          variant: "destructive",
        });
        return;
      }

      // Validate if product can be moved to NEW status
      if (ProductStatusService.validateStatus(response.data)) {
        await ProductStatusService.updateStatus(
          response.data.id,
          'NEW',
          user.id,
          'Auto-transition: All required fields present'
        );
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      router.push("/dashboard/products");
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred during product creation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add New Product</h1>
        <p className="text-sm text-muted-foreground">
          Create a new product and configure its Digital Product Passport
        </p>
      </div>

      <Card className="p-6">
        <ProductForm onSubmit={handleSubmit} companyType={company?.companyType || null} />
      </Card>
    </div>
  );
}