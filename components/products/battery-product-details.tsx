"use client";

import { motion } from "framer-motion";
import { ArrowLeft, HardHat, Warehouse } from "lucide-react";
import { useTranslations } from 'next-intl';
import Link from "next/link";

import { ProductQR } from "@/components/products/product-qr";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types/product";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

import { BasicInformationCard } from "./product-details/BasicInformationCard";
import { CertificationsCard } from "./product-details/CertificationsCard";
import { EmergencyProceduresCard } from "./product-details/EmergencyProceduresCard";
import { HazardPictogramsCard } from "./product-details/HazardPictogramsCard";
import { MaterialsCard } from "./product-details/MaterialsCard";
import { ProductHeader } from "./product-details/ProductHeader";
import { ProductImageGallery } from "./product-details/ProductImageGallery";
import { ProductKeyFeatures } from "./product-details/ProductKeyFeatures";
import { ProductQuickInfo } from "./product-details/ProductQuickInfo";
import { SustainabilityMetricsCard } from "./product-details/SustainabilityMetricsCard";

interface BatteryProductDetailsProps {
  product: Product;
}

export function BatteryProductDetails({ product }: BatteryProductDetailsProps) {
  const t = useTranslations('product.details');

  // Extract data from DPP config
  const getFieldValue = (sectionId: string, fieldId: string) => {
    if (!product?.dpp_config?.sections) return undefined;

    const section = product.dpp_config.sections.find((s) => s.id === sectionId);
    if (!section?.fields) return undefined;

    const field = section.fields.find((f) => f.id === fieldId);
    return field?.value;
  };

  const getFieldsByType = (sectionId: string, fieldType: string) => {
    if (!product?.dpp_config?.sections) return [];

    const section = product.dpp_config.sections.find((s) => s.id === sectionId);
    if (!section?.fields) return [];

    return section.fields.filter((f) => f.type === fieldType) || [];
  };

  // Get manufacturer and category from basic info section
  const manufacturer =
    (getFieldValue("basic-info", "manufacturer") as string) || "";
  const category = (getFieldValue("basic-info", "category") as string) || "";

  // Get materials from materials section
  const materials = getFieldsByType("materials", "material").map((field) => ({
    name: field.name,
    percentage: (field.value as any)?.percentage || 0,
    recyclable: (field.value as any)?.recyclable || false,
    description: (field.value as any)?.description || "",
  }));

  // Get certifications from certifications section
  const certifications = getFieldsByType("certifications", "certification").map(
    (field) => ({
      name: field.name,
      issuedBy: (field.value as any)?.issuedBy || "",
      validUntil: (field.value as any)?.validUntil || "",
      status: (field.value as any)?.status || "unknown",
      documentUrl: (field.value as any)?.documentUrl || "",
    })
  );

  // Get technical specs from key_features
  const features = product.key_features;

  // Get environmental metrics
  const environmentalFields =
    product.dpp_config?.sections
      .find((s) => s.id === "environmental")
      ?.fields?.map((field) => ({
        id: field.id,
        name: field.name,
        value:
          typeof field.value === "object"
            ? JSON.stringify(field.value)
            : field.value,
      })) || [];

  // Predefined arrays for specific sections
  const hazardPictograms = [
    {
      src: "/images/hazard-health.gif",
      alt: t('hazards.health'),
      description: t('hazards.healthDesc'),
    },
    {
      src: "/images/hazard-explosive.gif",
      alt: t('hazards.corrosive'),
      description: t('hazards.corrosiveDesc'),
    },
    {
      src: "/images/hazard-warning.png",
      alt: t('hazards.warning'),
      description: t('hazards.warningDesc'),
    },
    {
      src: "/images/hazard-explosive.jpeg",
      alt: t('hazards.explosive'),
      description: t('hazards.explosiveDesc'),
    },
    {
      src: "/images/hazard-environmental.png",
      alt: t('hazards.environmental'),
      description: t('hazards.environmentalDesc'),
    },
  ];

  const safetyMeasures = [
    t('safety.measures.careful'),
    t('safety.measures.upright'),
    t('safety.measures.ventilation'),
    t('safety.measures.water'),
    t('safety.measures.goggles'),
    t('safety.measures.clothing'),
  ];

  const emergencyProcedures = [
    t('emergency.procedures.contact'),
    t('emergency.procedures.clothing'),
    t('emergency.procedures.ingestion'),
    t('emergency.procedures.spill'),
    t('emergency.procedures.gases'),
    t('emergency.procedures.spark'),
    t('emergency.procedures.fire'),
    t('emergency.procedures.devices'),
  ];

  const storageGuidelines = [
    {
      title: t('storage.general.title'),
      items: [
        t('storage.general.dry'),
        t('storage.general.pallet'),
      ],
    },
    {
      title: t('storage.charge.title'),
      items: [
        t('storage.charge.sale'),
        t('storage.charge.minimum'),
        t('storage.charge.damage'),
      ],
    },
    {
      title: t('storage.installation.title'),
      items: [
        t('storage.installation.verify'),
        t('storage.installation.engine'),
        t('storage.installation.remove'),
        t('storage.installation.control'),
        t('storage.installation.clean'),
        t('storage.installation.install'),
        t('storage.installation.check'),
      ],
    },
  ];

  // Enhanced Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 50,
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 300,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto space-y-16 px-4 py-12 max-w-7xl"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Link href="/products">
          <motion.div whileHover="hover" variants={itemVariants}>
            <Button
              variant="ghost"
              size="sm"
              className="gradient-hover group flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              {t('navigation.backToProducts')}
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Product Overview */}
      <motion.div
        variants={itemVariants}
        className="grid gap-12 lg:grid-cols-2 items-start max-w-[1400px] mx-auto"
      >
        {/* Image Gallery */}
        <ProductImageGallery
          images={product.images}
          name={product.name}
        />

        {/* Product Details */}
        <motion.div variants={itemVariants} className="space-y-8">
          {/* Product Title and Description */}
          <ProductHeader
            name={product.name}
            description={product.description}
          />

          {/* Quick Info Cards */}
          <ProductQuickInfo
            title={t('quickInfo.model')}
            model={product.model}
            manufacturer={manufacturer}
          />

          {/* Key Features */}
          <ProductKeyFeatures 
            title={t('keyFeatures.title')}
            features={features} 
          />
        </motion.div>
      </motion.div>

      <div className="space-y-8 mt-16">
        {/* Basic Information */}
        <BasicInformationCard
          title={t('basicInfo.title')}
          manufacturer={manufacturer}
          category={category}
        />

        {/* Hazard Pictograms */}
        <HazardPictogramsCard
          title={t('hazards.title')}
          pictograms={hazardPictograms}
        />

        {/* Materials */}
        <MaterialsCard
          title={t('materials.title')}
          materials={materials}
        />

        {/* Health and Safety Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-primary" />
              <CardTitle>{t('safety.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 list-disc pl-6">
              {safetyMeasures.map((measure, index) => (
                <li key={index} className="text-muted-foreground">
                  {measure}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Emergency Procedures */}
        <EmergencyProceduresCard
          title={t('emergency.title')}
          procedures={emergencyProcedures}
        />

        {/* Storage and Installation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              <CardTitle>{t('storage.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {storageGuidelines.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <CertificationsCard
          title={t('certifications.title')}
          certifications={certifications}
        />

        {/* Sustainability Metrics */}
        <SustainabilityMetricsCard
          title={t('sustainability.title')}
          metrics={environmentalFields.map(field => ({
            id: field.id,
            name: field.name,
            value: field.value || ''
          }))}
        />

        {/* QR Code */}
        <Card className="lg:col-span-2">
          <ProductQR 
            productId={product.id} 
            productName={product.name}
            title={t('qr.title')}
            description={t('qr.description')}
          />
        </Card>
      </div>
    </motion.div>
  );
}
