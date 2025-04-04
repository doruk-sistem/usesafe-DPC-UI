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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white rounded-xl shadow-lg p-6 border"
    >
      <h2 className="text-xl font-semibold mb-4">
        {t("title")}
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {t("noActivities")}
          </p>
        )}
      </h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4 p-4 
              hover:bg-muted/50 rounded-lg 
              transition-colors duration-200 group"
          >
            <div
              className={`
              p-3 rounded-full 
              ${
                activity.status === "NEW"
                  ? "bg-green-100 text-green-600"
                  : activity.status === "DRAFT"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-red-100 text-red-600"
              }
            `}
            >
              {activity.status === "NEW" && (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {activity.status === "DRAFT" && <Box className="h-5 w-5" />}
              {activity.status === "DELETED" && <XCircle className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{activity.name}</h3>
              <p className="text-sm text-muted-foreground">
                {activity.id} ·{" "}
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div
              className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${
                activity.status === "NEW"
                  ? "bg-green-50 text-green-600"
                  : activity.status === "DRAFT"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-red-50 text-red-600"
              }
            `}
            >
              {t(`status.${activity.status}`)}
            </div>
          </motion.div>
        ))}
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
    </motion.div>
  );
}
