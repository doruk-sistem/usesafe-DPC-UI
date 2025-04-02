"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  FileQuestion, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";

const pendingApplications = [
  {
    id: "DPC-001",
    product: "AGM LEO Advanced Battery",
    status: "pending",
    submittedDate: "2024-01-15"
  },
  {
    id: "DPC-002",
    product: "EFB MAX TIGRIS Battery",
    status: "review",
    submittedDate: "2024-01-20"
  },
  {
    id: "DPC-003",
    product: "MAXIM A GORILLA Battery",
    status: "rejected",
    submittedDate: "2024-01-10"
  }
];

export function PendingApplications() {
  const t = useTranslations("dashboard.applications");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-lg p-6 border"
    >
      <h2 className="text-xl font-semibold mb-4">{t("title")}</h2>
      <div className="space-y-4">
        {pendingApplications.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4 p-4 
              hover:bg-muted/50 rounded-lg 
              transition-colors duration-200 group"
          >
            <div className={`
              p-3 rounded-full 
              ${app.status === 'pending' 
                ? 'bg-blue-100 text-blue-600'
                : app.status === 'review'
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-red-100 text-red-600'}
            `}>
              {app.status === 'pending' && <FileQuestion className="h-5 w-5" />}
              {app.status === 'review' && <CheckCircle2 className="h-5 w-5" />}
              {app.status === 'rejected' && <XCircle className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{app.product}</h3>
              <p className="text-sm text-muted-foreground">
                {app.id} · {t("submitted")} {app.submittedDate}
              </p>
            </div>
            <div className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${app.status === 'pending' 
                ? 'bg-blue-50 text-blue-600'
                : app.status === 'review'
                ? 'bg-yellow-50 text-yellow-600'
                : 'bg-red-50 text-red-600'}
            `}>
              {t(`status.${app.status}`)}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}