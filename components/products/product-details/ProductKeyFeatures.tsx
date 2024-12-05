"use client";

import { motion } from "framer-motion";

import { TechnicalSpec } from "@/lib/data/products";

interface ProductKeyFeaturesProps {
  technicalSpecs: TechnicalSpec[];
  itemVariants: any;
}

export function ProductKeyFeatures({ 
  technicalSpecs, 
  itemVariants 
}: ProductKeyFeaturesProps) {
  return (
    <motion.div 
      variants={itemVariants}
      className="border-t border-b py-8 space-y-6 border-border/50"
    >
      <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
      <div className="grid grid-cols-2 gap-4">
        {technicalSpecs.map((spec, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg"
          >
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary"></div>
            <div>
              <span className="text-sm font-medium block">{spec.name}</span>
              <span className="text-sm text-muted-foreground">{spec.value}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 