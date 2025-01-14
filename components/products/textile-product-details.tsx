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

  // Get environmental metrics
  const environmentalFields = product.dpp_config?.sections
    .find(s => s.id === "environmental")
    ?.fields.map(field => ({
      id: field.id,
      name: field.name,
      value: typeof field.value === 'object' ? JSON.stringify(field.value) : field.value
    })) || [];

  // Get care instructions
  const careInstructions = product.dpp_config?.sections.find(s => s.id === "care-instructions")?.fields || [];

  // Get basic info from key_features
  const basicInfo = {
    model: product.model,
    serialNumber: product.key_features.find(f => f.name === "Serial Number")?.value || "",
    manufacturingDate: product.key_features.find(f => f.name === "Manufacturing Date")?.value || "",
    origin: product.key_features.find(f => f.name === "Origin")?.value || "",
    weight: product.key_features.find(f => f.name === "Weight")?.value || "",
    dimensions: product.key_features.find(f => f.name === "Dimensions")?.value || ""
  };

  const containerVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      y: 20, 
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
            features={product.key_features} 
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

        {/* Materials */}
        <MaterialsCard 
          materials={materials} 
          itemVariants={itemVariants} 
        />

        {/* Care Instructions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bakım Talimatları</CardTitle>
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