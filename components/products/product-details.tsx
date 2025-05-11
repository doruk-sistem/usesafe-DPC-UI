"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BaseProduct, KeyFeature, ProductImage } from "@/lib/types/product";

import { BasicInformationCard } from "./product-details/BasicInformationCard";
import { CertificationsCard } from "./product-details/CertificationsCard";
import { ProductHeader } from "./product-details/ProductHeader";
import { ProductImageGallery } from "./product-details/ProductImageGallery";
import { ProductKeyFeatures } from "./product-details/ProductKeyFeatures";
import { ProductQuickInfo } from "./product-details/ProductQuickInfo";
import { SustainabilityMetricsCard } from "./product-details/SustainabilityMetricsCard";
import { ProductQR } from "./product-qr";

interface ProductDetailsProps {
  product: BaseProduct;
  additionalComponents?: React.ReactNode;
}

export function ProductDetails({ product, additionalComponents }: ProductDetailsProps) {
  const t = useTranslations("products.details");

  // DPP config'den veri çıkarma fonksiyonları
  const getFieldValue = (sectionId: string, fieldId: string) => {
    const section = product.dpp_config?.sections.find(s => s.id === sectionId);
    const field = section?.fields.find(f => f.id === fieldId);
    return field?.value;
  };

  const getFieldsByType = (sectionId: string, fieldType: string) => {
    const section = product.dpp_config?.sections.find(s => s.id === sectionId);
    return section?.fields.filter(f => f.type === fieldType) || [];
  };

  // Temel bilgileri al
  const manufacturer = product.manufacturer || getFieldValue("basic-info", "manufacturer") as string || "";
  const category = getFieldValue("basic-info", "category") as string || product.product_type || "";
  // Sertifikaları al
  const certifications = getFieldsByType("certifications", "certification").map(field => ({
    name: field.name,
    issuedBy: (field.value as any).issuedBy,
    validUntil: (field.value as any).validUntil,
    status: (field.value as any).status,
    documentUrl: (field.value as any).documentUrl
  }));

  // Çevresel metrikleri al
  const environmentalFields = product.dpp_config?.sections
    .find(s => s.id === "environmental")
    ?.fields.map(field => ({
      id: field.id,
      name: field.name,
      value: field.value
    })) || [];

  return (
    <div className="container mx-auto space-y-16 px-4 py-12 max-w-7xl">
      {/* Geri Dönüş Butonu */}
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gradient-hover group flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {t("backToProducts")}
          </Button>
        </Link>
      </div>

      {/* Ürün Genel Bakış */}
      <div className="grid gap-12 lg:grid-cols-2 items-start max-w-[1400px] mx-auto">
        {/* Görsel Galerisi */}
        <ProductImageGallery 
          images={product.images} 
          name={product.name}
        />

        {/* Ürün Detayları */}
        <div className="space-y-8">
          <ProductHeader 
            name={product.name} 
            description={product.description}
          />

          <ProductQuickInfo 
            title={t("quickInfo.title")}
            model={product.model || ""} 
            manufacturer={typeof manufacturer === 'string' ? manufacturer : manufacturer.name}
          />

          <ProductKeyFeatures 
            title={t("keyFeatures.title")}
            features={product.key_features}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mt-16 max-w-[1400px] mx-auto">
        {/* Temel Bilgiler */}
        <BasicInformationCard 
          title={t("basicInfo.title")}
          manufacturer={typeof manufacturer === 'string' ? manufacturer : manufacturer.name} 
          category={category}
        />

        {/* Sertifikalar */}
        <CertificationsCard 
          title={t("certifications.title")}
          productId={product.id}
        />

        {/* Sürdürülebilirlik Metrikleri */}
        <SustainabilityMetricsCard 
          title={t("sustainability.title")}
          metrics={environmentalFields}
        />

        {/* Kategoriye Özel Bileşenler */}
        {additionalComponents}

        {/* QR Kod */}
        <Card className="lg:col-span-2">
          <ProductQR 
            productId={product.id} 
            productName={product.name}
            title={t("qr.title")}
            description={t("qr.description")}
          />
        </Card>
      </div>
    </div>
  );
} 