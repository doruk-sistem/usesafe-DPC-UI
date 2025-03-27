"use client";

import { motion } from "framer-motion";
import { Barcode, Factory } from "lucide-react";
import { useTranslations } from 'next-intl';

import { Card } from "@/components/ui/card";

export interface ProductQuickInfoProps {
  title: string;
  model: string;
  manufacturer: string;
}

export function ProductQuickInfo({ title, model, manufacturer }: ProductQuickInfoProps) {
  const t = useTranslations('product.details');

  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        whileHover={{ scale: 1.02 }}
      >
        <Card className="p-4 flex items-center gap-3">
          <Barcode className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="font-medium">{model}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
      >
        <Card className="p-4 flex items-center gap-3">
          <Factory className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{t('quickInfo.manufacturer')}</p>
            <p className="font-medium">{manufacturer}</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 