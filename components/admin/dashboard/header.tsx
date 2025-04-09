"use client";

import { motion } from "framer-motion";
import { Download, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DashboardHeader() {
  const t = useTranslations("adminDashboard");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20"
        >
          <Shield className="h-8 w-8 text-primary" />
        </motion.div>
        <div>
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-3xl font-bold"
          >
            {t("title")}
          </motion.h1>
          <motion.p 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            {t("description")}
          </motion.p>
        </div>
      </div>
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2"
      >
        <Select defaultValue="today">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("period.select")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{t("period.today")}</SelectItem>
            <SelectItem value="week">{t("period.thisWeek")}</SelectItem>
            <SelectItem value="month">{t("period.thisMonth")}</SelectItem>
            <SelectItem value="quarter">{t("period.thisQuarter")}</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="icon"
          className="hover:bg-primary/10 transition-colors duration-300"
        >
          <Download className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}