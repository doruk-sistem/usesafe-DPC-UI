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
      {products.map((product) => (
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
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 bg-background/70 rounded-full p-1">
                  {getSustainabilityIcon(product.sustainabilityScore)}
                </div>
              </div>
              
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {product.name}
                    <Badge variant="secondary" className="ml-2">
                      {product.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <Factory className="w-4 h-4 mr-2 text-muted-foreground" />
                    {product.manufacturer}
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
                      variant={getSustainabilityVariant(product.sustainabilityScore)}
                      className="flex items-center gap-1"
                    >
                      {getSustainabilityIcon(product.sustainabilityScore)}
                      {product.sustainabilityScore}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Carbon Footprint
                    </span>
                    <span 
                      className={`text-sm font-medium ${
                        parseCarbonFootprint(product.carbonFootprint) <= 50 
                          ? 'text-green-600' 
                          : parseCarbonFootprint(product.carbonFootprint) <= 100 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                      }`}
                    >
                      {product.carbonFootprint}
                    </span>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-full bg-muted rounded-full h-2 mt-4"
                  >
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${product.sustainabilityScore}%` }}
                      transition={{ duration: 1 }}
                      className="bg-primary h-full rounded-full"
                    />
                  </motion.div>
                </div>
              </CardContent>
            </EnhancedCard>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}