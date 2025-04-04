"use client";

import { motion } from "framer-motion";

interface ProductHeaderProps {
  name: string;
  description: string;
}

export function ProductHeader({
  name,
  description,
}: ProductHeaderProps) {
  return (
    <div className="space-y-6 top-4">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight"
      >
        {name}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl text-muted-foreground leading-relaxed"
      >
        {description}
      </motion.p>
    </div>
  );
}
