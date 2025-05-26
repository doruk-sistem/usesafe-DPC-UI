"use client";

import { motion } from "framer-motion";
import { 
  FileQuestion, 
  CheckCircle2, 
  XCircle,
  Loader2 
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useProducts } from "@/lib/hooks/use-products";
import { useAuth } from "@/lib/hooks/use-auth";

// Define the BaseProduct type
interface BaseProduct {
  id: string;
  name: string;
  status: string | null;
  created_at?: string;
  company_id: string;
  product_type: string;
  description: string;
  document_status?: string;
}

export function PendingApplications() {
  const t = useTranslations("dashboard.applications");
  const { company } = useAuth();
  const { products, isLoading, error } = useProducts(company?.id);

  // Filter pending applications - match admin panel logic
  const pendingApps = products.filter((p: BaseProduct) => {
    const status = (p.status || "").toUpperCase();
    const docStatus = (p.document_status || "").toUpperCase();
    
    // Show products that are either:
    // 1. Have status "PENDING"
    // 2. Have document_status "PENDING REVIEW"
    return status === "PENDING" || docStatus === "PENDING REVIEW";
  });

  // Loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border">
        <div className="text-red-600 flex items-center">
          <XCircle className="h-5 w-5 mr-2" />
          <span>Error loading applications</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-lg p-6 border"
    >
      <h2 className="text-xl font-semibold mb-4">{t("title")}</h2>
      <div className="space-y-4">
        {pendingApps.length === 0 ? (
          <div className="text-muted-foreground">{t("empty")}</div>
        ) : (
          pendingApps.map((app: BaseProduct, index: number) => (
            <motion.div
              key={app.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 \
                hover:bg-muted/50 rounded-lg \
                transition-colors duration-200 group"
            >
              <div className={`
                p-3 rounded-full 
                ${app.status === "PENDING"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-yellow-100 text-yellow-600"}
              `}>
                {app.status === "PENDING" && <FileQuestion className="h-5 w-5" />}
                {app.status === "NEW" && <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{app.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {app.id} · {t("submitted")} {app.created_at ? new Date(app.created_at).toLocaleDateString() : "-"}
                </p>
              </div>
              <div className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${app.status === "PENDING"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-yellow-50 text-yellow-600"}
              `}>
                {app.status === "PENDING" ? t("status.pending") : "Pending Review"}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}