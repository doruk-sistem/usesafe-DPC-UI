"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  hoverEffect?: boolean;
}

export function EnhancedCard({ 
  children, 
  className, 
  gradient = "from-background to-muted/50", 
  hoverEffect = true 
}: EnhancedCardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        `bg-gradient-to-br ${gradient} 
        rounded-xl shadow-lg p-6 
        border border-border/50 
        overflow-hidden 
        transition-all duration-300`,
        className
      )}
    >
      {children}
    </motion.div>
  );
} 