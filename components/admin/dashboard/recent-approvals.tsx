"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { MetricsService, type RecentApproval } from "@/lib/services/metrics";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export function RecentApprovals() {
  const t = useTranslations("adminDashboard");
  const [approvals, setApprovals] = useState<RecentApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const data = await MetricsService.getRecentApprovals();
        setApprovals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovals();

    // Set up real-time subscription
    const subscription = supabase
      .channel('recent-approvals')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'companies'
      }, () => {
        fetchApprovals();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t("recentApprovals.title")}</h3>
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
        ) : approvals.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("recentApprovals.noApprovals")}
          </p>
        ) : (
          approvals.map((approval, index) => (
            <motion.div
              key={approval.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{approval.name}</p>
                <p className="text-sm text-muted-foreground">
                  {approval.code} • {new Date(approval.timestamp).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
} 