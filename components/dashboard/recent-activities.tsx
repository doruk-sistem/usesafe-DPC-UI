"use client";

import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Clock 
} from "lucide-react";

import { EnhancedCard } from "@/components/ui/enhanced-card";

const activities = [
  {
    icon: Upload,
    title: "New Product Uploaded",
    description: "AGM LEO Advanced Battery",
    time: "2 mins ago",
    status: "success"
  },
  {
    icon: CheckCircle2,
    title: "Certification Approved",
    description: "ISO 9001 Certificate",
    time: "15 mins ago",
    status: "success"
  },
  {
    icon: AlertCircle,
    title: "Pending Review",
    description: "EFB MAX TIGRIS Battery",
    time: "45 mins ago",
    status: "warning"
  }
];

export function RecentActivities() {
  return (
    <EnhancedCard>
      <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4 p-4 
              hover:bg-muted/50 rounded-lg 
              transition-colors duration-200 group"
          >
            <div className={`
              p-3 rounded-full 
              ${activity.status === 'success' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-yellow-100 text-yellow-600'}
            `}>
              <activity.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{activity.title}</h3>
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>
            </div>
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-1 opacity-50" />
              {activity.time}
            </div>
          </motion.div>
        ))}
      </div>
    </EnhancedCard>
  );
}