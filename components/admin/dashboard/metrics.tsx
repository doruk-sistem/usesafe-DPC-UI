"use client";

import { motion } from "framer-motion";
import {
  Users,
  FileCheck,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

export function DashboardMetrics() {
  const t = useTranslations("adminDashboard");

  const metrics = [
    {
      title: t("metrics.totalManufacturers"),
      value: "1,284",
      change: "+12.3%",
      trend: "up",
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: t("metrics.pendingApprovals"),
      value: "23",
      change: "-4.5%",
      trend: "down",
      icon: Clock,
      gradient: "from-amber-500 to-amber-600",
    },
    {
      title: t("metrics.activeDPCs"),
      value: "3,891",
      change: "+23.1%",
      trend: "up",
      icon: Shield,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: t("metrics.documentVerifications"),
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: FileCheck,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: t("metrics.systemAlerts"),
      value: "12",
      change: "-2.4%",
      trend: "down",
      icon: AlertTriangle,
      gradient: "from-red-500 to-red-600",
    },
    {
      title: t("metrics.verificationRate"),
      value: "98.3%",
      change: "+1.2%",
      trend: "up",
      icon: CheckCircle2,
      gradient: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient} bg-opacity-10`}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  metric.trend === "up" ? "text-green-500" : "text-red-500"
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-muted-foreground">{t("metrics.vsLastMonth")}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}