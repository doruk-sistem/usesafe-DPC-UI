"use client";

import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KeyFeature } from "@/lib/types/product";

export interface ProductKeyFeaturesProps {
  features: KeyFeature[];
  itemVariants: any;
}

export function ProductKeyFeatures({ features, itemVariants }: ProductKeyFeaturesProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            <CardTitle>Key Features</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="font-medium">{feature.name}:</span>
                <span className="text-muted-foreground">
                  {feature.value}
                  {feature.unit && ` ${feature.unit}`}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 