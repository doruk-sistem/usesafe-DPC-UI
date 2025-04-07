"use client";

import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { motion } from "framer-motion";
import { Box, CheckCircle2, XCircle, FileText, Trash2, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";

import { useProducts } from "@/lib/hooks/use-products";
import { cn } from "@/lib/utils";
import { getRecentActivities } from "@/lib/utils/metrics";

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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white rounded-xl shadow-lg p-6 border"
    >
      <h2 className="text-xl font-semibold mb-4">
        {t("title")}
      </h2>
      <div className="divide-y divide-border rounded-md border">
        {activities.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {t("noActivities")}
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
                    {t(`status.${activity.status}`)}
                  </p>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
