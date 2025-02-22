"use client";

import { motion } from "framer-motion";

interface ProductHeaderProps {
  name: string;
  description: string;
  itemVariants: any;
}

export function ProductHeader({
  name,
  description,
  itemVariants,
}: ProductHeaderProps) {
  return (
    <div className="space-y-6 top-4">
      <motion.h1
        variants={itemVariants}
        className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight"
      >
        {name}
      </motion.h1>
      <motion.p
        variants={itemVariants}
        className="text-xl text-muted-foreground leading-relaxed"
      >
        {description}
      </motion.p>
    </div>
  );
}
