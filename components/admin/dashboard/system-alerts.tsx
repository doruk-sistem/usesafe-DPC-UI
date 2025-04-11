"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { getSystemAlerts, type SystemAlert } from "@/app/api/metrics/route";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export function SystemAlerts() {
  const t = useTranslations("adminDashboard");
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const alerts = await getSystemAlerts();
        setAlerts(alerts);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('system-alerts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'system_alerts'
      }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100';
      case 'medium':
        return 'bg-amber-100';
      default:
        return 'bg-blue-100';
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t("systemAlerts.title")}</h3>
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : alerts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("systemAlerts.noAlerts")}
          </p>
        ) : (
          alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-full ${getSeverityColor(alert.severity)} flex items-center justify-center`}>
                {getSeverityIcon(alert.severity)}
              </div>
              <div>
                <p className="font-medium">{alert.message}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleTimeString()} • {t(`systemAlerts.severity.${alert.severity}`)}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}