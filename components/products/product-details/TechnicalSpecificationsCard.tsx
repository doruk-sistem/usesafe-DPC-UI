"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TechnicalSpec } from "@/lib/data/products";

interface TechnicalSpecificationsCardProps {
  technicalSpecs: TechnicalSpec[];
  cardVariants: any;
}

export function TechnicalSpecificationsCard({ 
  technicalSpecs, 
  cardVariants 
}: TechnicalSpecificationsCardProps) {
  return (
    <motion.div 
      variants={cardVariants}
      whileHover="hover"
    >
      <Card className="bg-gradient-to-br from-background to-muted shadow-lg card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Technical Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {technicalSpecs.map((spec, index) => (
              <div key={index} className="flex justify-between">
                <dt className="text-sm font-medium">{spec.name}</dt>
                <dd className="text-sm text-primary">{spec.value}</dd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 