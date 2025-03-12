"use client";

import { useRouter } from "next/navigation";

import { ProductForm } from "@/components/dashboard/products/product-form";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { ProductService } from "@/lib/services/product";
import { productBlockchainService } from "@/lib/services/product-blockchain";
import { ProductStatusService } from "@/lib/services/product-status";
import { StorageService } from "@/lib/services/storage";
import type { NewProduct, ProductImage } from "@/lib/types/product";

export default function NewProductPageClient() {
  const { user, company } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: NewProduct) => {
    if (!user?.id || !company?.id) return;

    try {
      const uploadedImages = await Promise.all(
        data.images.map(async (image) => {
          // Use type assertion to access fileObject
          const typedImage = image as ProductImage;
          if (image.url.startsWith("blob:") && typedImage.fileObject) {
            const uploadedUrl = await StorageService.uploadProductImage(
              typedImage.fileObject,
              company.id
            );

            if (!uploadedUrl) {
              toast({
                title: "Image Upload Error",
                description:
                  "Failed to upload one or more images. Please try again.",
                variant: "destructive",
              });
              return null;
            }

            return {
              ...image,
              url: uploadedUrl,
            };
          }
          return image;
        })
      );

      // Filter out any null images
      const validImages = uploadedImages.filter((img) => img !== null);

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
        status_history: [
          {
            from: null,
            to: "DRAFT",
            timestamp: new Date().toISOString(),
            userId: user.id,
          },
        ],
      });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error.message,
          variant: "destructive",
        });
        return;
      }

      if (!response.data?.id) {
        throw new Error("Product ID not received from server");
      }

      // Blockchain kaydı oluştur
      try {
        const blockchainResult =
          await productBlockchainService.recordProductAction(
            response.data.id,
            data.name,
            data.manufacturer_id,
            data.description,
            "CREATE"
          );

        // Update the product with contract address
        // await ProductService.updateProduct(response.data.id, {
        //   contract_address: blockchainResult.contractAddress,
        // });

        toast({
          title: "Success",
          description: `Product created and recorded to blockchain. Contract Address: ${blockchainResult.contractAddress}`,
        });
      } catch (blockchainError) {
        toast({
          title: "Warning",
          description:
            "Product created but blockchain record failed: " +
            (blockchainError instanceof Error
              ? blockchainError.message
              : "Unknown error"),
          variant: "destructive",
        });
      }

      // Validate if product can be moved to NEW status
      if (ProductStatusService.validateStatus(response.data)) {
        await ProductStatusService.updateStatus(
          response.data.id,
          "NEW",
          user.id,
          "Auto-transition: All required fields present"
        );
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      // Başarılı kayıt sonrası detay sayfasına yönlendir
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the product",
        variant: "destructive",
      });
      throw error;
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
        <ProductForm
          onSubmit={handleSubmit}
          companyType={company?.companyType || null}
        />
      </Card>
    </div>
  );
}
