"use client";

import { motion } from "framer-motion";
import { ArrowLeft, HardHat, Warehouse } from "lucide-react";
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
  // Extract data from DPP config
  const getFieldValue = (sectionId: string, fieldId: string) => {
    if (!product?.dpp_config?.sections) return undefined;
    
    const section = product.dpp_config.sections.find(s => s.id === sectionId);
    if (!section?.fields) return undefined;
    
    const field = section.fields.find(f => f.id === fieldId);
    return field?.value;
  };

  const getFieldsByType = (sectionId: string, fieldType: string) => {
    if (!product?.dpp_config?.sections) return [];
    
    const section = product.dpp_config.sections.find(s => s.id === sectionId);
    if (!section?.fields) return [];
    
    return section.fields.filter(f => f.type === fieldType) || [];
  };

  // Get manufacturer and category from basic info section
  const manufacturer = getFieldValue("basic-info", "manufacturer") as string || "";
  const category = getFieldValue("basic-info", "category") as string || "";

  // Get materials from materials section
  const materials = getFieldsByType("materials", "material").map(field => ({
    name: field.name,
    percentage: (field.value as any)?.percentage || 0,
    recyclable: (field.value as any)?.recyclable || false,
    description: (field.value as any)?.description || ""
  }));

  // Get certifications from certifications section
  const certifications = getFieldsByType("certifications", "certification").map(field => ({
    name: field.name,
    issuedBy: (field.value as any)?.issuedBy || "",
    validUntil: (field.value as any)?.validUntil || "",
    status: (field.value as any)?.status || "unknown",
    documentUrl: (field.value as any)?.documentUrl || ""
  }));

  // Get technical specs from key_features
  const features = product.key_features;

  // Get environmental metrics
  const environmentalFields = product.dpp_config?.sections
    .find(s => s.id === "environmental")
    ?.fields?.map(field => ({
      id: field.id,
      name: field.name,
      value: typeof field.value === 'object' ? JSON.stringify(field.value) : field.value
    })) || [];

  // Predefined arrays for specific sections
  const hazardPictograms = [
    { src: "/images/hazard-health.gif", alt: "Health Hazard", description: "May cause respiratory irritation" },
    { src: "/images/hazard-explosive.gif", alt: "Corrosive", description: "Contains corrosive materials" },
    { src: "/images/hazard-warning.png", alt: "Warning", description: "General safety warning" },
    { src: "/images/hazard-explosive.jpeg", alt: "Explosive", description: "Risk of explosion under specific conditions" },
    { src: "/images/hazard-environmental.png", alt: "Environmental Hazard", description: "May pollute water sources" },
  ];

  const safetyMeasures = [
    "Always carry the batteries carefully.",
    "Always keep in the upright position.",
    "Charge in a well-ventilated place.",
    "Do not add extra quantities of pure water. (Pure water level must not be more than 1.5 cm above the plates.)",
    "During battery maintenance (addition of water, cleaning, battery charge), absolutely wear protective goggles suitable with working conditions.",
    "In case of any possible acid splash risk, wear protective clothing.",
  ];

  const emergencyProcedures = [
    "In case of contact with eyes or skin wash with plenty of water.",
    "Immediately remove contaminated clothing.",
    "Ingestion: Drink plenty of water and milk. Consult a physician.",
    "Spill: Wash small-spills with water.",
    "Operating batteries emit highly flammable hydrogen and oxygen gases.",
    "Do not smoke or avoid any sources and acts which may cause sparks near batteries which are being charged, operating on the vehicle, or stopped after a long operation period.",
    "Keep fire away.",
    "Use all devices with great care.",
  ];

  const storageGuidelines = [
    {
      title: "General Storage",
      items: [
        "Always store in a dry and cool place in the upright position. (10°C to 25°C).",
        "Place batteries on a wood pallet for avoiding direct contact with concrete ground.",
      ]
    },
    {
      title: "Charge Level Monitoring",
      items: [
        "Charge level of the battery must be greater than 12.6V before sale.",
        "During storage, the minimum voltage must be 12.4V.",
        "For preventing permanent damage, unpack and charge at 16.1V and 1/20Cn current if voltage is low.",
      ]
    },
    {
      title: "Installation Steps",
      items: [
        "Verify battery compatibility with vehicle manual",
        "Ensure engine is switched off",
        "Remove old battery (negative terminal first)",
        "Conduct short-circuit control",
        "Clean battery compartment and terminals",
        "Install new battery (connect positive cable first)",
        "Check charge current compatibility",
      ]
    }
  ];

  // Enhanced Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      y: 50, 
      opacity: 0,
      scale: 0.9
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    },
    hover: {
      scale: 1.03,
      transition: { 
        type: "spring", 
        stiffness: 300 
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: { 
        type: "spring", 
        stiffness: 300 
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto space-y-16 px-4 py-12 max-w-7xl"
    >
      {/* Back Button */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-4"
      >
        <Link href="/products">
          <motion.div
            whileHover="hover"
            variants={itemVariants}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="gradient-hover group flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Products
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
          itemVariants={itemVariants} 
        />

        {/* Product Details */}
        <motion.div 
          variants={itemVariants}
          className="space-y-8"
        >
          {/* Product Title and Description */}
          <ProductHeader 
            name={product.name} 
            description={product.description} 
            itemVariants={itemVariants} 
          />

          {/* Quick Info Cards */}
          <ProductQuickInfo 
            model={product.model}
            manufacturer={manufacturer}
            cardVariants={cardVariants} 
          />

          {/* Key Features */}
          <ProductKeyFeatures 
            features={features}
            itemVariants={itemVariants} 
          />
        </motion.div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2 mt-16 max-w-[1400px] mx-auto">
        {/* Basic Information */}
        <BasicInformationCard 
          manufacturer={manufacturer}
          category={category}
          model={product.model}
          cardVariants={cardVariants} 
        />

        {/* Hazard Pictograms */}
        <HazardPictogramsCard 
          hazardPictograms={hazardPictograms} 
          itemVariants={itemVariants} 
        />

        {/* Materials */}
        <MaterialsCard 
          materials={materials} 
          itemVariants={itemVariants} 
        />

        {/* Health and Safety Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-primary" />
              <CardTitle>Health and Safety Measures</CardTitle>
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
          emergencyProcedures={emergencyProcedures} 
          itemVariants={itemVariants} 
        />

        {/* Storage and Installation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              <CardTitle>Storage and Installation Guidelines</CardTitle>
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
          certifications={certifications} 
          itemVariants={itemVariants} 
        />

        {/* Sustainability Metrics */}
        <SustainabilityMetricsCard 
          environmentalFields={environmentalFields}
          cardVariants={cardVariants} 
        />

        {/* QR Code */}
        <Card className="lg:col-span-2">
          <ProductQR productId={product.id} productName={product.name} />
        </Card>
      </div>
    </motion.div>
  );
}