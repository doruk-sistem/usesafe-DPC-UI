"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface BasicInformationCardProps {
  manufacturer: string;
  category: string;
  model: string;
  cardVariants: any;
}

export function BasicInformationCard({ 
  manufacturer, 
  category, 
  model,
  cardVariants 
}: BasicInformationCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <CardTitle>Basic Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <span className="font-medium">Manufacturer:</span>
              <span className="text-muted-foreground">{manufacturer}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">Category:</span>
              <span className="text-muted-foreground">{category}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">Model:</span>
              <span className="text-muted-foreground">{model}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 