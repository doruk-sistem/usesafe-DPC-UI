"use client";

import { motion } from "framer-motion";
import { Box, CheckCircle2, XCircle } from "lucide-react";
import { useProducts } from "@/lib/hooks/use-products";
import { getRecentActivities } from "@/lib/utils/metrics";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function RecentActivities() {
  const { products } = useProducts();
  const activities = getRecentActivities(products);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white rounded-xl shadow-lg p-6 border"
    >
      <h2 className="text-xl font-semibold mb-4">
        Recent Activities
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            No recent activities found
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
            <div className={`
              p-3 rounded-full 
              ${activity.status === 'NEW'
                ? 'bg-green-100 text-green-600'
                : activity.status === 'DRAFT'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-red-100 text-red-600'}
            `}>
              {activity.status === 'NEW' && <CheckCircle2 className="h-5 w-5" />}
              {activity.status === 'DRAFT' && <Box className="h-5 w-5" />}
              {activity.status === 'DELETED' && <XCircle className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{activity.name}</h3>
              <p className="text-sm text-muted-foreground">
                {activity.id} · {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
            <div className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${activity.status === 'NEW'
                ? 'bg-green-50 text-green-600'
                : activity.status === 'DRAFT'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-red-50 text-red-600'}
            `}>
              {activity.status}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}