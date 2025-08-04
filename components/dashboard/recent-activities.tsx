"use client";

import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { tr } from "date-fns/locale";
import { motion } from "framer-motion";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { useAuth } from "@/lib/hooks/use-auth";
import { useProducts } from "@/lib/hooks/use-products";
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

function getPaginationRange(current: number, total: number): (number | string)[] {
  const delta = 2;
  const range: (number | string)[] = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  if (current - delta > 2) {
    range.unshift('...');
  }
  if (current + delta < total - 1) {
    range.push('...');
  }
  range.unshift(1);
  if (total > 1) range.push(total);
  return range;
}

export function RecentActivities() {
  const t = useTranslations("dashboard.activities");
  const { user, company } = useAuth();
  const { products } = useProducts(company?.id);
  const activities = getRecentActivities(products || []);

  // Pagination
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedActivities = activities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
        {paginatedActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4 p-4 \
              hover:bg-muted/50 rounded-lg \
              transition-colors duration-200 group"
          >
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate max-w-[180px]" title={activity.name}>{activity.name}</h3>
              <p className="text-sm text-muted-foreground truncate max-w-[160px]">
                {t("status." + activity.status.toLowerCase())} · {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: tr })}
              </p>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 whitespace-nowrap">
              {t("status." + activity.status.toLowerCase())}
            </div>
          </motion.div>
        ))}
      </div>
      {/* Pagination UI */}
      {totalPages > 1 && (
        <nav className="flex justify-center items-center gap-1 mt-6 select-none" aria-label="Pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 text-lg
              ${currentPage === 1 ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed' : 'bg-white hover:bg-muted/70 border-muted text-muted-foreground'}`}
            aria-label="Önceki Sayfa"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {getPaginationRange(currentPage, totalPages).map((page, idx) =>
            typeof page === 'string'
              ? <span key={"ellipsis-"+idx} className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm">...</span>
              : <button
                  key={page}
                  onClick={() => setCurrentPage(Number(page))}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 font-medium
                    ${currentPage === page
                      ? 'bg-primary/10 text-primary border-primary font-semibold'
                      : 'bg-white text-muted-foreground border-muted hover:bg-muted/70'}
                  `}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
          )}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors duration-150 text-lg
              ${currentPage === totalPages ? 'bg-muted text-muted-foreground border-muted cursor-not-allowed' : 'bg-white hover:bg-muted/70 border-muted text-muted-foreground'}`}
            aria-label="Sonraki Sayfa"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </motion.div>
  );
}