"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

import { DashboardHeader } from "@/components/admin/dashboard/header";
import { DashboardMetrics } from "@/components/admin/dashboard/metrics";
import { PendingApprovals } from "@/components/admin/dashboard/pending-approvals";
import { SystemAlerts } from "@/components/admin/dashboard/system-alerts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function AdminDashboard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <DashboardHeader />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardMetrics />
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <PendingApprovals />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SystemAlerts />
        </motion.div>
      </div>
    </motion.div>
  );
}