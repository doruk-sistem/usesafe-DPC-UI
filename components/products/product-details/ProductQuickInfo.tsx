"use client";

import { motion } from "framer-motion";

interface ProductQuickInfoProps {
  model: string;
  serialNumber: string;
  cardVariants: any;
}

export function ProductQuickInfo({ 
  model, 
  serialNumber, 
  cardVariants 
}: ProductQuickInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <motion.div 
        variants={cardVariants}
        whileHover="hover"
        className="p-5 rounded-2xl bg-gradient-to-br from-background to-muted/50 shadow-lg card-hover"
      >
        <p className="text-sm text-muted-foreground mb-2">Model</p>
        <p className="font-semibold text-lg">{model}</p>
      </motion.div>
      <motion.div 
        variants={cardVariants}
        whileHover="hover"
        className="p-5 rounded-2xl bg-gradient-to-br from-background to-muted/50 shadow-lg card-hover"
      >
        <p className="text-sm text-muted-foreground mb-2">Serial Number</p>
        <p className="font-semibold text-lg">{serialNumber}</p>
      </motion.div>
    </div>
  );
} 