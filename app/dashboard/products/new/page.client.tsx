"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ProductForm } from "@/components/dashboard/products/product-form";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { ProductService } from "@/lib/services/product";
import { productBlockchainService } from "@/lib/services/product-blockchain";
import { ProductStatusService } from "@/lib/services/product-status";
import { StorageService } from "@/lib/services/storage";
import type { NewProduct, ProductImage, ProductStatus } from "@/lib/types/product";
import type { ProductFormData } from "@/lib/types/forms";
import type { Json } from "@/lib/types/supabase";

export default function NewProductPageClient() {
  const { user, company } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("productManagement.addProduct");

  const handleSubmit = async (data: ProductFormData) => {
    if (!user?.id || !company?.id) return;

    try {
      const uploadedImages = await Promise.all(
        data.images.map(async (image) => {
          if (image.url.startsWith("blob:") && "fileObject" in image) {
            const uploadedUrl = await StorageService.uploadProductImage(
              image.fileObject as File,
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
              url: uploadedUrl,
              alt: image.alt,
              is_primary: image.is_primary,
            };
          }
          return {
            url: image.url,
            alt: image.alt,
            is_primary: image.is_primary,
          };
        })
      );

      const validImages = uploadedImages.filter((img): img is ProductImage => img !== null);

      if (validImages.length === 0) {
        toast({
          title: t("error.title"),
          description: t("error.noImages"),
          variant: "destructive",
        });
        return;
      }

      const initialStatus: ProductStatus = "DRAFT";

      const productData: NewProduct = {
        name: data.name,
        description: data.description,
        product_type: data.product_type,
        model: data.model,
        images: validImages,
        key_features: data.key_features,
        documents: data.documents as unknown as Json,
        manufacturer_id: data.manufacturer_id,
        company_id: company.id,
        status: initialStatus,
        status_history: [
          {
            from: null as any,
            to: initialStatus,
            timestamp: new Date().toISOString(),
            userId: user.id,
          },
        ],
      };

      const response = await ProductService.createProduct(productData);

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

      try {
        const blockchainResult =
          await productBlockchainService.recordProductAction(
            response.data.id,
            data.name,
            data.manufacturer_id || "",
            data.description || "",
            "CREATE"
          );

        toast({
          title: t("success.title"),
          description: t("success.blockchain", {
            address: blockchainResult.contractAddress
          }),
        });
      } catch (blockchainError) {
        toast({
          title: t("error.title"),
          description: t("error.blockchain", {
            error: blockchainError instanceof Error
              ? blockchainError.message
              : "Unknown error"
          }),
          variant: "destructive",
        });
      }

      if (response.data && ProductStatusService.validateStatus(response.data)) {
        const newStatus: ProductStatus = "NEW";
        await ProductStatusService.updateStatus(
          response.data.id,
          newStatus,
          user.id,
          "Auto-transition: All required fields present"
        );
      }

      toast({
        title: t("success.title"),
        description: t("success.description"),
      });

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
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <Card className="p-6">
        <ProductForm onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}
