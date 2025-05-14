"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ProductForm } from "@/components/dashboard/products/product-form";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { productService } from "@/lib/services/product";
import { productBlockchainService } from "@/lib/services/product-blockchain";
import { ProductStatusService } from "@/lib/services/product-status";
import { StorageService } from "@/lib/services/storage";
import type { NewProduct, ProductImage } from "@/lib/types/product";

export default function NewProductPageClient() {
  const { user, company } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("productManagement.addProduct");

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
                title: t("error.title"),
                description: t("error.imageUpload"),
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
          title: t("error.title"),
          description: t("error.noImages"),
          variant: "destructive",
        });
        return;
      }

      // Continue with product creation using validImages
      const response = await productService.createProduct({
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
          title: t("error.title"),
          description: response.error.message,
          variant: "destructive",
        });
        return;
      }

      if (!response.data?.id) {
        throw new Error("Product ID not received from server");
      }

      // Blockchain kaydı oluştur - Temporarily disabled due to insufficient HBAR balance
      /*
      try {
        console.log('Starting blockchain record creation...', {
          productId: response.data.id,
          name: data.name,
          manufacturer: data.manufacturer_id,
          description: data.description
        });

        const blockchainResult =
          await productBlockchainService.recordProductAction(
            response.data.id,
            data.name,
            data.manufacturer_id,
            data.description ?? "",
            "CREATE"
          );

        console.log('Blockchain record created successfully:', blockchainResult);

        toast({
          title: t("success.title"),
          description: t("success.blockchain", {
            address: blockchainResult.contractAddress,
          }),
        });
      } catch (blockchainError) {
        console.error('Detailed blockchain error:', {
          error: blockchainError,
          message: blockchainError instanceof Error ? blockchainError.message : 'Unknown error',
          stack: blockchainError instanceof Error ? blockchainError.stack : undefined
        });

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
      */

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
        title: t("success.title"),
        description: t("success.description"),
      });

      // Başarılı kayıt sonrası detay sayfasına yönlendir
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: t("error.title"),
        description: t("error.description"),
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <Card className="p-6">
        <ProductForm onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}
