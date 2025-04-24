"use client";

import { motion } from "framer-motion";
import {
  Box,
  FileText,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { EnhancedCard } from "@/components/ui/enhanced-card";
import { useProducts } from "@/lib/hooks/use-products";
import { cn } from "@/lib/utils";
import { calculateProductGrowth } from "@/lib/utils/metrics";
import { useMetrics } from "@/lib/hooks/useMetrics";

export function DashboardMetrics() {
  const t = useTranslations("dashboard.metrics");
  const { products } = useProducts();
  const productGrowth = calculateProductGrowth(products);

  const { metrics, isLoading } = useMetrics(); // 🎯 hook ile veri çekiliyor

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const metricCards = [
    {
      title: t("totalProducts"),
      value: products?.length ? products.length.toString() : "0",
      icon: Box,
      gradient: "from-blue-500 to-blue-700",
      trend: `${productGrowth > 0 ? "+" : ""}${productGrowth}%`,
    },
    {
      title: t("pendingCertifications"),
      value: isLoading
        ? "..."
        : metrics?.pendingApprovals?.count.toString() ?? "0",
      icon: AlertTriangle,
      gradient: "from-yellow-500 to-yellow-700",
      trend: isLoading
        ? ""
        : `${metrics?.pendingApprovals?.change ?? 0}%`,
    },
    {
      title: t("approvedDocuments"),
      value: isLoading
        ? "..."
        : metrics?.documentVerifications?.count.toString() ?? "0",
      icon: FileText,
      gradient: "from-green-500 to-green-700",
      trend: isLoading
        ? ""
        : `${metrics?.documentVerifications?.change ?? 0}%`,
    },
    {
      title: t("complianceRate"),
      value: isLoading
        ? "..."
        : `${metrics?.verificationRate?.rate.toFixed(1) ?? 0}%`,
      icon: ShieldCheck,
      gradient: "from-purple-500 to-purple-700",
      trend: isLoading
        ? ""
        : `${metrics?.verificationRate?.change ?? 0}%`,
    },
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
              stiffness: 100,
            }}
            className="flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-white/80 mb-2">{card.title}</p>
              <h3 className="text-3xl font-bold text-white">{card.value}</h3>
              {card.trend && (
                <div
                  className={cn(
                    "flex items-center mt-2 text-xs",
                    card.trend.startsWith("+")
                      ? "text-green-300"
                      : "text-red-300"
                  )}
                >
                  {card.trend.startsWith("+") ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span>{card.trend}</span>
                </div>
              )}
            </div>
            <card.icon className="h-12 w-12 text-white/30" />
          </motion.div>
        </EnhancedCard>
      ))}
    </motion.div>
  );
}
