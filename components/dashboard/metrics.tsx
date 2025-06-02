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
import { REQUIRED_DOCUMENTS } from "@/lib/constants/documents";
import { useCompanyDocuments } from "@/lib/hooks/use-company-documents";
import { useProducts } from "@/lib/hooks/use-products";
import { cn } from "@/lib/utils";
import { calculateProductGrowth } from "@/lib/utils/metrics";

const CERTIFICATE_TYPES = [
  "quality_certificate",
  "safety_certificate",
  "environmental_certificate",
  "iso_certificate",
  "export_certificate",
  "production_certificate",
  "activity_permit"
];

const DOCUMENT_TYPES = [
  "signature_circular",
  "trade_registry_gazette",
  "tax_plate",
  "activity_certificate"
];

export function DashboardMetrics() {
  const t = useTranslations("dashboard.metrics");
  const { useGetCompanyDocuments } = useCompanyDocuments();
  const { data: documents = [], isLoading: docsLoading } = useGetCompanyDocuments();
  const { products, isLoading: productsLoading } = useProducts();
  const productGrowth = calculateProductGrowth(products);

  if (docsLoading || productsLoading) {
    return <div>Loading...</div>;
  }

  // Belgeler ve sertifikaları ayır
  const certificates = documents.filter((d: any) => CERTIFICATE_TYPES.includes(d.type));
  const regularDocuments = documents.filter((d: any) => DOCUMENT_TYPES.includes(d.type));

  // Sertifika metrikleri (ORİJİNAL)
  const approvedCertificates = certificates.filter((d: any) => d.status === "approved").length;
  const pendingCertificates = certificates.filter((d: any) => d.status === "pending").length;
  const complianceRate = certificates.length > 0
    ? Math.round((approvedCertificates / certificates.length) * 100)
    : 0;

  // Belge metrikleri
  const approvedDocuments = regularDocuments.filter((d: any) => d.status === "approved").length;
  const pendingDocuments = regularDocuments.filter((d: any) => d.status === "pending").length;

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
      value: pendingCertificates.toString(),
      icon: AlertTriangle,
      gradient: "from-yellow-500 to-yellow-700",
      trend: "",
    },
    {
      title: t("approvedDocuments"),
      value: approvedDocuments.toString(),
      icon: FileText,
      gradient: "from-green-500 to-green-700",
      trend: "",
    },
    {
      title: t("complianceRate"),
      value: `${complianceRate}%`,
      icon: ShieldCheck,
      gradient: "from-purple-500 to-purple-700",
      trend: "",
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
              <div
                className={cn(
                  "flex items-center mt-2 text-xs",
                  card.trend.startsWith("+") ? "text-green-300" : "text-red-300"
                )}
              >
                {card.trend.startsWith("+") ? (
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