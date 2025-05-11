"use client";

import { motion } from "framer-motion";
import { ArrowLeft, HardHat, Warehouse } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { ProductQR } from "@/components/products/product-qr";
import { Button } from "@/components/ui/button";
import { KeyFeature, Product, ProductImage } from "@/lib/types/product";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

import { BasicInformationCard } from "./product-details/BasicInformationCard";
import { CertificationsCard } from "./product-details/CertificationsCard";
import { MaterialsCard } from "./product-details/MaterialsCard";
import { ProductHeader } from "./product-details/ProductHeader";
import { ProductImageGallery } from "./product-details/ProductImageGallery";
import { ProductKeyFeatures } from "./product-details/ProductKeyFeatures";
import { ProductQuickInfo } from "./product-details/ProductQuickInfo";
import { SustainabilityMetricsCard } from "./product-details/SustainabilityMetricsCard";

interface TextileProductDetailsProps {
  product: Product;
}

export function TextileProductDetails({ product }: TextileProductDetailsProps) {
  const t = useTranslations("products.details");

  // Extract data from DPP config
  const getFieldValue = (sectionId: string, fieldId: string) => {
    const section = product.dpp_config?.sections.find(s => s.id === sectionId);
    const field = section?.fields.find(f => f.id === fieldId);
    return field?.value;
  };

  const getFieldsByType = (sectionId: string, fieldType: string) => {
    const section = product.dpp_config?.sections.find(s => s.id === sectionId);
    return section?.fields.filter(f => f.type === fieldType) || [];
  };

  // Get manufacturer and category from basic info section
  const manufacturer = getFieldValue("basic-info", "manufacturer") as string || "";
  const category = getFieldValue("basic-info", "category") as string || "";

  // Get materials from materials section
  const materials = getFieldsByType("materials", "material").map(field => ({
    name: field.name,
    percentage: (field.value as any).percentage,
    recyclable: (field.value as any).recyclable,
    description: (field.value as any).description
  }));

  // Get certifications from certifications section
  const certifications = getFieldsByType("certifications", "certification").map(field => ({
    name: field.name,
    issuedBy: (field.value as any).issuedBy,
    validUntil: (field.value as any).validUntil,
    status: (field.value as any).status,
    documentUrl: (field.value as any).documentUrl
  }));

  // Get environmental metrics with proper type checking and conversion
  const environmentalFields = product.dpp_config?.sections
    .find(s => s.id === "environmental")
    ?.fields.map(field => {
      let value: string | number = 0;
      if (typeof field.value === "string" || typeof field.value === "number") {
        value = field.value;
      } else if (Array.isArray(field.value)) {
        value = field.value.join(", ");
      } else if (typeof field.value === "object" && field.value !== null) {
        value = JSON.stringify(field.value);
      }
      return {
        id: field.id,
        name: field.name,
        value
      };
    }) || [];

  // Get care instructions
  const careInstructions = product.dpp_config?.sections.find(s => s.id === "care-instructions")?.fields || [];

  return (
    <div className="container mx-auto space-y-16 px-4 py-12 max-w-7xl">
      {/* Back Button */}
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

      {/* Product Overview */}
      <div className="grid gap-12 lg:grid-cols-2 items-start max-w-[1400px] mx-auto">
        {/* Image Gallery */}
        <ProductImageGallery 
          images={product.images as ProductImage[]} 
          name={product.name}
        />

        {/* Product Details */}
        <div className="space-y-8">
          {/* Product Title and Description */}
          <ProductHeader 
            name={product.name} 
            description={product.description}
          />

          {/* Quick Info Cards */}
          <ProductQuickInfo 
            title={t("quickInfo.title")}
            model={product.model} 
            manufacturer={manufacturer}
          />

          {/* Key Features */}
          <ProductKeyFeatures 
            title={t("keyFeatures.title")}
            features={product.key_features as KeyFeature[]}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mt-16 max-w-[1400px] mx-auto">
        {/* Basic Information */}
        <BasicInformationCard 
          title={t("basicInfo.title")}
          manufacturer={manufacturer} 
          category={category}
        />

        {/* Materials */}
        <MaterialsCard 
          title={t("materials.title")}
          materials={materials}
        />

        {/* Care Instructions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("textile.careInstructions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {careInstructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="font-medium">{instruction.name}:</span>
                  <span className="text-muted-foreground">{instruction.value as string}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <CertificationsCard 
          title={t("certifications.title")}
          productId={product.id}
        />

        {/* Sustainability Metrics */}
        <SustainabilityMetricsCard 
          title={t("sustainability.title")}
          metrics={environmentalFields}
        />

        {/* QR Code */}
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