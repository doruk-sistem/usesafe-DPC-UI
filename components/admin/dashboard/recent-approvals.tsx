"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { getRecentApprovals, type RecentApproval } from "@/lib/hooks/useMetrics";
import { Card } from "@/components/ui/card";
import { Error } from "@/components/ui/error";

export function RecentApprovals() {
  const t = useTranslations("adminDashboard");
  const [approvals, setApprovals] = useState<RecentApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const data = await getRecentApprovals();
        setApprovals(data);
      } catch (err: unknown) {
        setError(typeof err === 'object' && err !== null && 'message' in err
          ? (err as Error).message
          : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  if (error) {
    return <Error error={error} />;
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