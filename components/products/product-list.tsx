"use client";

import { motion } from "framer-motion";
import { Leaf, Factory, TreePine, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProductCategories } from "@/lib/hooks/use-product-categories";
import { useProducts } from "@/lib/hooks/use-products";
import { BaseProduct } from "@/lib/types/product";

export function ProductList() {
  const t = useTranslations("products.list");
  const { user, isLoading: authLoading } = useAuth();
  const { getCategoryName } = useProductCategories();

  const { products, isLoading } = useProducts(undefined, true);

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const getSustainabilityScore = (product: BaseProduct) => {
    const score = product.key_features?.find(
      (f) => f.name === "Sustainability Score"
    )?.value;
    return typeof score === "number" ? score : 0;
  };

  const getCarbonFootprint = (product: BaseProduct) => {
    const footprint = product.key_features?.find(
      (f) => f.name === "Carbon Footprint"
    )?.value;
    return typeof footprint === "string" ? footprint : "0 kg CO2e";
  };

  const getManufacturer = (product: BaseProduct) => {
    // Önce manufacturer objesinden name'i al
    if (product.manufacturer?.name) {
      return product.manufacturer.name;
    }
    
    // Eğer manufacturer objesi yoksa ama manufacturer_id varsa
    if (product.manufacturer_id) {
      return t("quickInfo.loading");
    }
    
    // Hiçbir üretici bilgisi yoksa
    return t("quickInfo.unknown");
  };

  const getCategory = (product: BaseProduct) => {
    // Önce key_features içinde Category var mı diye kontrol et
    const categoryFromFeatures = product.key_features?.find(
      (f) => f.name === "Category"
    )?.value;
    
    // Eğer key_features içinde Category varsa onu kullan
    if (typeof categoryFromFeatures === "string") {
      return categoryFromFeatures;
    }
    
    // Yoksa product_type'ı kategori ID'si olarak kullan ve kategori adını getir
    return getCategoryName(product.product_type);
  };

  const getSustainabilityIcon = (score: number) => {
    if (score >= 90) return <Sparkles className="w-5 h-5 text-green-500" />;
    if (score >= 75) return <Leaf className="w-5 h-5 text-green-500" />;
    if (score >= 50) return <TreePine className="w-5 h-5 text-yellow-500" />;
    return <Factory className="w-5 h-5 text-red-500" />;
  };

  const getSustainabilityVariant = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "destructive";
  };

  const parseCarbonFootprint = (footprint: string): number => {
    return parseFloat(footprint.replace(" kg CO2e", ""));
  };

  if (authLoading || isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[400px] bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10 space-y-4">
        <p className="text-lg font-medium">{t("loginRequired")}</p>
        <Link 
          href="/auth/login" 
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {t("loginButton")}
        </Link>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">{t("empty.description")}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {products.map((product) => {
        const sustainabilityScore = getSustainabilityScore(product);
        const carbonFootprint = getCarbonFootprint(product);
        const manufacturer = getManufacturer(product);
        const category = getCategory(product);
        const primaryImage =
          product.images?.find((img) => img.is_primary) || product.images?.[0];

        return (
          <motion.div
            key={product.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="group"
          >
            <Link href={`/products/${product.id}`}>
              <EnhancedCard
                hoverEffect={true}
                className="overflow-hidden h-full"
              >
                <div className="relative group h-[300px]">
                  {primaryImage && (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.alt || product.name}
                      fill
                      className="object-contain bg-white"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={true}
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-background/70 rounded-full p-1">
                    {getSustainabilityIcon(sustainabilityScore)}
                  </div>
                </div>

                <CardHeader>
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {product.name}
                      <Badge variant="secondary" className="ml-2">
                        {category}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <Factory className="w-4 h-4 mr-2 text-muted-foreground" />
                      {manufacturer}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("sustainability.score")}
                      </span>
                      <Badge
                        variant={getSustainabilityVariant(sustainabilityScore)}
                        className="flex items-center gap-1"
                      >
                        {getSustainabilityIcon(sustainabilityScore)}
                        {sustainabilityScore}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("sustainability.carbonFootprint")}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          parseCarbonFootprint(carbonFootprint) <= 50
                            ? "text-green-600"
                            : parseCarbonFootprint(carbonFootprint) <= 100
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {carbonFootprint}
                      </span>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-full bg-muted rounded-full h-2 mt-4"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sustainabilityScore}%` }}
                        transition={{ duration: 1 }}
                        className="bg-primary h-full rounded-full"
                      />
                    </motion.div>
                  </div>
                </CardContent>
              </EnhancedCard>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
