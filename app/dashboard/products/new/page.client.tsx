"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ProductForm } from "@/components/dashboard/products/product-form";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AI_TO_STANDARD_MAPPING } from "@/lib/constants/documents";
import { useAuth } from "@/lib/hooks/use-auth";
import { DocumentService } from "@/lib/services/document";
import { productService } from "@/lib/services/product";
import { productBlockchainService } from "@/lib/services/product-blockchain";
import { ProductStatusService } from "@/lib/services/product-status";
import { StorageService } from "@/lib/services/storage";
import { SustainabilityCalculatorService, SustainabilityMetrics } from "@/lib/services/sustainability-calculator";
import type { NewProduct, ProductImage } from "@/lib/types/product";

export default function NewProductPageClient() {
  const { user, company } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("productManagement.addProduct");

  const handleSubmit = async (
    data: (NewProduct & { materials?: any[]; documentFiles?: Record<string, any[]> })
  ) => {
    if (!user?.id || !company?.id) return;

    try {
      // 1. Önce resimleri yükle
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

      // 2. Belgeleri documents tablosuna kaydet
      const uploadedDocuments: any = {};
      
      if (data.documentFiles) {
        await Promise.all(
          Object.entries(data.documentFiles).map(async ([aiDocType, docs]) => {
            // Tüm AI belgelerini technical_docs türüne yükle
            const standardDocType = "technical_docs";
            
            if (Array.isArray(docs)) {
              // technical_docs için array oluştur (eğer yoksa)
              if (!uploadedDocuments[standardDocType]) {
                uploadedDocuments[standardDocType] = [];
              }
              
              const uploadedDocs = await Promise.all(
                docs.map(async (doc: any) => {
                  if (doc.file) {
                    try {
                      // Dosyayı yükle ve documents tablosuna kaydet
                      const result = await DocumentService.uploadDocument(doc.file, {
                        companyId: company.id,
                        bucketName: process.env.NEXT_PUBLIC_PRODUCT_DOCUMENTS_BUCKET || "product-documents",
                      }, {
                        name: doc.name,
                        type: standardDocType,
                        originalType: aiDocType,
                        fileSize: doc.fileSize,
                        version: doc.version,
                        validUntil: doc.validUntil,
                        notes: doc.notes,
                        productId: data.id // Ürün ID'si henüz yok, sonra güncellenecek
                      });

                      return {
                        ...doc,
                        url: result?.url || "",
                        documentId: result?.documentId || "",
                        file: undefined, // File objesini kaldır
                        type: standardDocType, // Hepsi technical_docs
                        originalType: aiDocType // Orijinal AI türünü sakla
                      };
                    } catch (error) {
                      console.error(`Error uploading file ${doc.name}:`, error);
                      return {
                        ...doc,
                        url: "",
                        documentId: "",
                        file: undefined,
                        type: standardDocType,
                        originalType: aiDocType
                      };
                    }
                  }
                  return {
                    ...doc,
                    type: standardDocType,
                    originalType: aiDocType
                  };
                })
              );
              
              // technical_docs'e ekle
              uploadedDocuments[standardDocType].push(...uploadedDocs);
            }
          })
        );
      }

      // 3. Sürdürülebilirlik metriklerini hesapla (eğer materyal verileri varsa)
      let sustainabilityMetrics: SustainabilityMetrics | null = null;
      if (data.materials && data.materials.length > 0) {
        try {
          sustainabilityMetrics = await SustainabilityCalculatorService.calculateFromProductType(
            data.product_type,
            data.product_subcategory,
            data.materials
          );
          
          toast({
            title: "Sustainability Calculation",
            description: "Sustainability metrics calculated successfully using AI",
          });
        } catch (error) {
          console.error("Error calculating sustainability metrics:", error);
          toast({
            title: "Warning",
            description: "Product created but sustainability calculation failed",
            variant: "destructive",
          });
        }
      }

      // 4. Ürünü oluştur - materials alanını products tablosuna göndermeden ayır
      const { documentFiles, materials, ...productData } = data;
      
      const response = await productService.createProduct({
        ...productData,
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
        dpp_config: sustainabilityMetrics ? {
          sections: [
            {
              id: "environmental",
              title: "Environmental Metrics",
              fields: [
                { id: "sustainability-score", name: "Sustainability Score", value: sustainabilityMetrics.sustainability_score },
                { id: "carbon-footprint", name: "Carbon Footprint", value: sustainabilityMetrics.carbon_footprint },
                { id: "water-usage", name: "Water Usage", value: sustainabilityMetrics.water_usage },
                { id: "energy-consumption", name: "Energy Consumption", value: sustainabilityMetrics.energy_consumption },
                { id: "recycled-materials", name: "Recycled Materials", value: sustainabilityMetrics.recycled_materials },
                { id: "chemical-reduction", name: "Chemical Reduction", value: sustainabilityMetrics.chemical_reduction },
                { id: "biodegradability", name: "Biodegradability", value: sustainabilityMetrics.biodegradability },
              ]
            }
          ]
        } : undefined,
        materials,
      });

      // 4. Belgelerin productId'sini güncelle
      if (response.data?.id && uploadedDocuments.technical_docs) {
        await Promise.all(
          uploadedDocuments.technical_docs
            .filter((doc: any) => doc.documentId)
            .map(async (doc: any) => {
              try {
                await DocumentService.updateDocumentProductId(doc.documentId, response.data!.id);
              } catch (error) {
                console.error(`Error updating document ${doc.documentId} with productId:`, error);
              }
            })
        );
      }

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

      // Blockchain kaydı oluştur
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
