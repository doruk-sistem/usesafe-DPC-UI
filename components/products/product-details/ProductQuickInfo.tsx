"use client";

import { motion } from "framer-motion";
import { Barcode, Factory } from "lucide-react";

import { Card } from "@/components/ui/card";

export interface ProductQuickInfoProps {
  model: string;
  manufacturer: string;
  cardVariants: any;
}

export function ProductQuickInfo({ model, manufacturer, cardVariants }: ProductQuickInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        variants={cardVariants}
        whileHover="hover"
      >
        <Card className="p-4 flex items-center gap-3">
          <Barcode className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Model</p>
            <p className="font-medium">{model}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        whileHover="hover"
      >
        <Card className="p-4 flex items-center gap-3">
          <Factory className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Manufacturer</p>
            <p className="font-medium">{manufacturer}</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 