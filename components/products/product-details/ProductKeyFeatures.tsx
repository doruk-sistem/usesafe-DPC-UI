"use client";

import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KeyFeature } from "@/lib/types/product";

export interface ProductKeyFeaturesProps {
  title: string;
  features: KeyFeature[];
}

export function ProductKeyFeatures({ title, features }: ProductKeyFeaturesProps) {
  const t = useTranslations("products.details.keyFeatures");

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            <CardTitle>{title}</CardTitle>
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