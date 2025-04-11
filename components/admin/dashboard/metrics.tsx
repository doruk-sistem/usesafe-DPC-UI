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
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getRecentApprovals, getSystemAlerts, type DashboardMetrics, type RecentApproval, type SystemAlert } from "@/app/api/metrics/route";
import { supabase } from "@/lib/supabase/client";

export function DashboardMetrics() {
  const t = useTranslations("adminDashboard");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const recentApprovals = await getRecentApprovals();
        const systemAlerts = await getSystemAlerts();
        // Handle the data as needed
        console.log(recentApprovals, systemAlerts);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();

    // Optional: Set up real-time subscription
    const subscription = supabase
      .channel('metrics-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'companies'
      }, () => {
        fetchMetrics();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const metricConfigs = [
    {
      key: 'totalManufacturers',
      title: t("metrics.totalManufacturers"),
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      getValue: () => ({
        value: metrics?.totalManufacturers.count.toLocaleString() ?? '0',
        change: metrics?.totalManufacturers.change ?? 0
      })
    },
    {
      key: 'pendingApprovals',
      title: t("metrics.pendingApprovals"),
      icon: Clock,
      gradient: "from-amber-500 to-amber-600",
      getValue: () => ({
        value: metrics?.pendingApprovals.count.toLocaleString() ?? '0',
        change: metrics?.pendingApprovals.change ?? 0
      })
    },
    {
      key: 'activeDPCs',
      title: t("metrics.activeDPCs"),
      icon: Shield,
      gradient: "from-green-500 to-green-600",
      getValue: () => ({
        value: metrics?.activeDPCs.count.toLocaleString() ?? '0',
        change: metrics?.activeDPCs.change ?? 0
      })
    },
    {
      key: 'documentVerifications',
      title: t("metrics.documentVerifications"),
      icon: FileCheck,
      gradient: "from-purple-500 to-purple-600",
      getValue: () => ({
        value: metrics?.documentVerifications.count.toLocaleString() ?? '0',
        change: metrics?.documentVerifications.change ?? 0
      })
    },
    {
      key: 'systemAlerts',
      title: t("metrics.systemAlerts"),
      icon: AlertTriangle,
      gradient: "from-red-500 to-red-600",
      getValue: () => ({
        value: metrics?.systemAlerts.count.toLocaleString() ?? '0',
        change: metrics?.systemAlerts.change ?? 0
      })
    },
    {
      key: 'verificationRate',
      title: t("metrics.verificationRate"),
      icon: CheckCircle2,
      gradient: "from-indigo-500 to-indigo-600",
      getValue: () => ({
        value: `${metrics?.verificationRate.rate.toFixed(1) ?? '0'}%`,
        change: metrics?.verificationRate.change ?? 0
      })
    },
  ];

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metricConfigs.map((config, index) => {
        const { value, change } = config.getValue();
        const trend = change >= 0 ? "up" : "down";

        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${isLoading ? 'animate-pulse' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
              <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {config.title}
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} bg-opacity-10`}>
                    <config.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    trend === "up" ? "text-green-500" : "text-red-500"
                  }`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">{t("metrics.vsLastMonth")}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}