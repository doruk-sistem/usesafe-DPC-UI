"use client";

import { motion } from "framer-motion";
import { Info, Building2, Receipt } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface BasicInformationCardProps {
  title: string;
  manufacturer: string;
  category: string;
  seller?: {
    name: string;
    taxNumber?: string;
  };
}

export function BasicInformationCard({
  title,
  manufacturer,
  category,
  seller,
}: BasicInformationCardProps) {
  const t = useTranslations("products.details.basicInfo");
  const tCategories = useTranslations("products.list.categories");

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <span className="font-medium">{t("manufacturer")}:</span>
              <span className="text-muted-foreground">{manufacturer}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">{t("category")}:</span>
              <span className="text-muted-foreground">{category}</span>
            </div>
            {seller && (
              <div className="space-y-3 border-t pt-3 mt-3">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <span className="font-medium">{t("seller")}:</span>
                    <span className="text-muted-foreground ml-2">{seller.name}</span>
                  </div>
                </div>
                {seller.taxNumber && (
                  <div className="flex items-start gap-2">
                    <Receipt className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{t("taxNumber")}:</span>
                      <span className="text-muted-foreground ml-2">{seller.taxNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
