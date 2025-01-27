"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Box, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle 
} from "lucide-react";
import { useProducts } from "@/lib/hooks/use-products";

import { EnhancedCard } from "@/components/ui/enhanced-card";
import { calculateProductGrowth } from "@/lib/utils/metrics";

export function DashboardMetrics() {
  const { products } = useProducts();
  const productGrowth = calculateProductGrowth(products);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const metricCards = [
    {
      title: "Total Products",
      value: products?.length.toString() || "0",
      icon: Box,
      gradient: "from-blue-500 to-blue-700",
      trend: `${productGrowth > 0 ? '+' : ''}${productGrowth}%`
    },
  {
    title: "Pending Certifications",
    value: "7",
    icon: AlertTriangle,
    gradient: "from-yellow-500 to-yellow-700",
    trend: "+3.2%"
  },
  {
    title: "Approved Documents",
    value: "128",
    icon: FileText,
    gradient: "from-green-500 to-green-700",
    trend: "+22.1%"
  },
  {
    title: "Compliance Rate",
    value: "94%",
    icon: ShieldCheck,
    gradient: "from-purple-500 to-purple-700",
    trend: "+5.6%"
  }
  ];
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {metricCards.map((card, index) => (
        <EnhancedCard 
          key={card.title}
          gradient={`bg-gradient-to-br ${card.gradient}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.2, 
              type: "spring", 
              stiffness: 100 
            }}
            className="flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-white/80 mb-2">{card.title}</p>
              <h3 className="text-3xl font-bold text-white">{card.value}</h3>
              <div className={cn(
                "flex items-center mt-2 text-xs",
                card.trend.startsWith('+') ? "text-green-300" : "text-red-300"
              )}>
                {card.trend.startsWith('+') ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{card.trend}</span>
              </div>
            </div>
            <card.icon className="h-12 w-12 text-white/30" />
          </motion.div>
        </EnhancedCard>
      ))}
    </motion.div>
  );
}