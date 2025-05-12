"use client";

import { motion } from "framer-motion";
import { Barcode, Factory } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

export interface ProductQuickInfoProps {
  title: string;
  model: string;
  manufacturer: {
    id: string;
    name: string;
    taxInfo?: any;
    companyType?: string;
    status?: boolean;
  } | string;
}

export function ProductQuickInfo({ title, model, manufacturer }: ProductQuickInfoProps) {
  const t = useTranslations("products.details.quickInfo");
  const tCategories = useTranslations("products.list.categories");

  // Get manufacturer name based on the type of manufacturer prop
  const manufacturerName = typeof manufacturer === 'string' 
    ? manufacturer 
    : manufacturer?.name || t("unknownManufacturer");

  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        whileHover={{ scale: 1.02 }}
      >
        <Card className="p-4 flex items-center gap-3">
          <Barcode className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{t("model")}</p>
            <p className="font-medium">{tCategories(model)}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
      >
        <Card className="p-4 flex items-center gap-3">
          <Factory className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{t("manufacturer")}</p>
            <p className="font-medium">{manufacturerName}</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 