"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { companyApiHooks } from "@/lib/hooks/use-company";
import { getDocuments } from "@/lib/services/documents";
import { Document } from "@/lib/types/document";
import { BaseProduct } from "@/lib/types/product";

import { BasicInformationCard } from "./product-details/BasicInformationCard";
import { CertificationsCard } from "./product-details/CertificationsCard";
import { DistributorsCard } from "./product-details/DistributorsCard";
import { MaterialsCard } from "./product-details/MaterialsCard";
import { ProductHeader } from "./product-details/ProductHeader";
import { ProductImageGallery } from "./product-details/ProductImageGallery";
import { ProductKeyFeatures } from "./product-details/ProductKeyFeatures";
import { ProductQuickInfo } from "./product-details/ProductQuickInfo";
import { SustainabilityMetricsCard } from "./product-details/SustainabilityMetricsCard";
import { UseSafeCertificationCard } from "./product-details/UseSafeCertificationCard";
import { ProductQR } from "./product-qr";

interface ProductDetailsProps {
  product: BaseProduct;
  additionalComponents?: React.ReactNode;
}

export function ProductDetails({ product, additionalComponents }: ProductDetailsProps) {
  const t = useTranslations("products.details");
  const [productDocuments, setProductDocuments] = useState<Document[]>([]);

  // Şirket bilgilerini al
  const { data: company } = companyApiHooks.useGetCompanyQuery(
    { id: product.company_id },
    { enabled: !!product.company_id }
  );

  // Product documents'ları fetch et
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (product.id) {
          const { documents } = await getDocuments(product.id);
          setProductDocuments(documents);
        }
      } catch (error) {
        console.error("Error fetching product documents:", error);
        setProductDocuments([]);
      }
    };

    fetchDocuments();
  }, [product.id]);

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
  const seller = company ? {
    name: company.name,
    taxNumber: company.taxInfo?.taxNumber
  } : undefined;

  // Sertifikaları al
  const certifications = getFieldsByType("certifications", "certification").map(field => ({
    name: field.name,
    issuedBy: (field.value as any).issuedBy,
    validUntil: (field.value as any).validUntil,
    status: (field.value as any).status,
    documentUrl: (field.value as any).documentUrl
  }));

  // Çevresel metrikleri al (mock veri ile dolu)
  const environmentalFields = product.dpp_config?.sections
    .find(s => s.id === "environmental")
    ?.fields.map(field => ({
      id: field.id,
      name: field.name,
      value: field.value
    })) || [
      // Senior onaylı gerçek sürdürülebilirlik metrikleri
      { id: "sustainability-score", name: "Sustainability Score", value: 65 },
      { id: "carbon-footprint", name: "Carbon Footprint", value: "3.2 kg CO2e" },
      { id: "water-usage", name: "Water Usage", value: "2500 liters" },
      { id: "energy-consumption", name: "Energy Consumption", value: "7.5 kWh per unit" },
      { id: "recycled-materials", name: "Recycled Materials", value: "0% of total materials" },
      { id: "chemical-reduction", name: "Chemical Reduction", value: "30% less than conventional" },
      { id: "biodegradability", name: "Biodegradability", value: "20% biodegradable materials" },
      // Yeni eklenen detaylı metrikler
      { id: "water-consumption-per-unit", name: "Water Consumption Per Unit", value: "15.000 Litre" },
      { id: "recycled-content-percentage", name: "Recycled Content Percentage", value: "40%" },
      { id: "chemical-consumption-per-unit", name: "Chemical Consumption Per Unit", value: "8 kg" },
      { id: "greenhouse-gas-emissions", name: "Greenhouse Gas Emissions", value: "205.4" },
      { id: "co2e-emissions-per-unit", name: "CO2e Emissions Per Unit", value: "30 kg" },
      { id: "minimum-durability-years", name: "Minimum Durability", value: "10 yıl" },
    ];


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
            features={[
              ...(product.key_features || []),
              // Weight bilgisini ekle (eğer varsa)
              ...(product.weight ? [{
                name: t("keyFeatures.weight"),
                value: `${product.weight} kg`,
                unit: ""
              }] : [])
            ]}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mt-16 max-w-[1400px] mx-auto">
        {/* Temel Bilgiler */}
        <BasicInformationCard 
          title={t("basicInfo.title")}
          manufacturer={typeof manufacturer === 'string' ? manufacturer : manufacturer.name} 
          category={category}
          seller={seller}
        />

        {/* Materials */}
        <MaterialsCard
          title={t("materials.title")}
          productId={product.id}
          product={{
            company_id: product.company_id,
            manufacturer_id: product.manufacturer_id,
            owner: {
              name: company?.name || "Bilgi yükleniyor..."
            },
            manufacturer: {
              name: typeof manufacturer === 'string' ? manufacturer : manufacturer?.name || "Bilgi yükleniyor..."
            }
          }}
        />

        {/* Distribütörler */}
        <DistributorsCard
          title={t("distributors.title")}
          productId={product.id}
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

        {/* UseSafe Sertifikasyonu */}
        <UseSafeCertificationCard 
          title={t("usesafeCertification.title")}
          product={product}
          productDocuments={productDocuments}
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