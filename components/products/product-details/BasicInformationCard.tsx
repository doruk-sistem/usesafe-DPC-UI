"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface BasicInformationCardProps {
  title: string;
  manufacturer: string;
  category: string;
}

export function BasicInformationCard({
  title,
  manufacturer,
  category,
}: BasicInformationCardProps) {
  const t = useTranslations("products.details.basicInfo");

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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
