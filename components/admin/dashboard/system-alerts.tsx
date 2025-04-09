"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Bell } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const alerts = [
  {
    id: "ALT-001",
    type: "warning",
    message: "highVolume",
    time: "10 minutes ago",
  },
  {
    id: "ALT-002",
    type: "error",
    message: "failedVerification",
    time: "25 minutes ago",
  },
  {
    id: "ALT-003",
    type: "info",
    message: "maintenance",
    time: "1 hour ago",
  },
];

export function SystemAlerts() {
  const t = useTranslations("adminDashboard");

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "warning";
      case "error":
        return "destructive";
      case "info":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
            <Bell className="h-5 w-5 text-red-500" />
          </div>
          {t("sections.systemAlerts.title")}
        </CardTitle>
        <CardDescription>{t("sections.systemAlerts.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Badge variant={getAlertVariant(alert.type)}>
                  {t(`sections.systemAlerts.alerts.${alert.message}`)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {alert.time}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}