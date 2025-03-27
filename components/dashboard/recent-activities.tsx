"use client";

import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Box, CheckCircle2, XCircle } from "lucide-react";
import { useProducts } from "@/lib/hooks/use-products";
import { getRecentActivities } from "@/lib/utils/metrics";
import { cn } from "@/lib/utils";
import { FileText, Trash2, PenLine } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function RecentActivities() {
  const t = useTranslations("dashboard.activities");
  const { products } = useProducts();
  const activities = getRecentActivities(products || []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      <div className="divide-y divide-border rounded-md border">
        {activities.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border",
                    {
                      "border-blue-100 bg-blue-50 text-blue-600":
                        activity.status === "NEW",
                      "border-yellow-100 bg-yellow-50 text-yellow-600":
                        activity.status === "DRAFT",
                      "border-red-100 bg-red-50 text-red-600":
                        activity.status === "DELETED",
                    }
                  )}
                >
                  {activity.status === "NEW" && (
                    <FileText className="h-5 w-5" />
                  )}
                  {activity.status === "DRAFT" && (
                    <PenLine className="h-5 w-5" />
                  )}
                  {activity.status === "DELETED" && (
                    <Trash2 className="h-5 w-5" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.name}
                  </p>
                  <p className="flex items-center text-sm text-muted-foreground">
                    {t("status." + activity.status.toLowerCase())}
                  </p>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {t("submitted")}:{" "}
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
