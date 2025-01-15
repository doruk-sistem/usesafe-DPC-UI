"use client";

import { motion } from "framer-motion";
import { 
  Leaf, 
  Factory, 
  TreePine, 
  Sparkles 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { products } from "@/lib/data/products";
import { textileProducts } from "@/lib/data/textile-products";
import { Product } from "@/lib/types/product";

export function ProductList() {
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const allProducts = [...textileProducts, ...products];

  const getSustainabilityScore = (product: Product) => {
    if (!product?.dpp_config?.sections) return 0;
    
    const environmentalSection = product.dpp_config.sections.find(s => s.id === "environmental");
    if (!environmentalSection?.fields) return 0;
    
    const score = environmentalSection.fields.find(f => f.id === "sustainability-score")?.value;
    return typeof score === 'number' ? score : 0;
  };

  const getCarbonFootprint = (product: Product) => {
    if (!product?.dpp_config?.sections) return "0 kg CO2e";
    
    const environmentalSection = product.dpp_config.sections.find(s => s.id === "environmental");
    if (!environmentalSection?.fields) return "0 kg CO2e";
    
    const footprint = environmentalSection.fields.find(f => f.id === "carbon-footprint")?.value;
    return typeof footprint === 'string' ? footprint : "0 kg CO2e";
  };

  const getManufacturer = (product: Product) => {
    if (!product?.dpp_config?.sections) return "Unknown";
    
    const basicInfoSection = product.dpp_config.sections.find(s => s.id === "basic-info");
    if (!basicInfoSection?.fields) return "Unknown";
    
    return basicInfoSection.fields.find(f => f.id === "manufacturer")?.value as string || "Unknown";
  };

  const getCategory = (product: Product) => {
    if (!product?.dpp_config?.sections) return product.product_type;
    
    const basicInfoSection = product.dpp_config.sections.find(s => s.id === "basic-info");
    if (!basicInfoSection?.fields) return product.product_type;
    
    return basicInfoSection.fields.find(f => f.id === "category")?.value as string || product.product_type;
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
    return parseFloat(footprint.replace(' kg CO2e', ''));
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {allProducts.map((product) => {
        const sustainabilityScore = getSustainabilityScore(product);
        const carbonFootprint = getCarbonFootprint(product);
        const manufacturer = getManufacturer(product);
        const category = getCategory(product);
        const primaryImage = product.images.find(img => img.is_primary) || product.images[0];

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
                <div className="aspect-video relative group">
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
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
                        Sustainability Score
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
                        Carbon Footprint
                      </span>
                      <span 
                        className={`text-sm font-medium ${
                          parseCarbonFootprint(carbonFootprint) <= 50 
                            ? 'text-green-600' 
                            : parseCarbonFootprint(carbonFootprint) <= 100 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
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