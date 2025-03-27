"use client";

import { motion } from "framer-motion";
import { Leaf, Droplets, Zap, Recycle, Beaker, Sprout } from "lucide-react";
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface SustainabilityMetricsCardProps {
  title: string;
  metrics: Array<{
    id: string;
    name: string;
    value: string | number;
  }>;
}

export function SustainabilityMetricsCard({ 
  title,
  metrics,
}: SustainabilityMetricsCardProps) {
  const t = useTranslations('product.details.sustainability');

  const getMetricIcon = (fieldId: string) => {
    switch (fieldId) {
      case "water-usage":
      case "water-saving":
        return <Droplets className="w-4 h-4" />;
      case "energy-consumption":
      case "renewable-energy":
        return <Zap className="w-4 h-4" />;
      case "recycled-materials":
      case "recycled-content":
        return <Recycle className="w-4 h-4" />;
      case "chemical-reduction":
      case "chemical-usage":
        return <Beaker className="w-4 h-4" />;
      case "biodegradability":
        return <Sprout className="w-4 h-4" />;
      default:
        return <Leaf className="w-4 h-4" />;
    }
  };

  const getSustainabilityColor = (fieldId: string, value: string | number) => {
    if (fieldId === "sustainability-score") {
      const score = typeof value === "number" ? value : parseInt(value);
      if (score >= 80) return "text-green-500";
      if (score >= 60) return "text-yellow-500";
      return "text-red-500";
    }
    return "text-muted-foreground";
  };

  const getValueWithUnit = (fieldId: string, value: string | number) => {
    if (fieldId === "sustainability-score") {
      return `${value}%`;
    }
    return value;
  };

  const getMetricName = (id: string) => {
    try {
      return t(`metrics.${id}`);
    } catch {
      return id;
    }
  };

  const calculateOverallProgress = () => {
    if (!metrics || metrics.length === 0) return 0;
    
    const totalValues = metrics.reduce((sum, metric) => {
      const value = typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    
    return Math.min(100, Math.max(0, (totalValues / metrics.length)));
  };

  const sustainabilityScore = metrics.find(f => f.id === "sustainability-score")?.value || 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="lg:col-span-2"
    >
      <Card className="bg-gradient-to-br from-background to-muted">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>{title}</CardTitle>
            </div>
            <Badge 
              variant={
                Number(sustainabilityScore) >= 80 ? "success" :
                Number(sustainabilityScore) >= 60 ? "warning" : "destructive"
              }
              className="text-lg px-4 py-1"
            >
              {sustainabilityScore}% {t('badge')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metrics
              .filter(field => field.id !== "sustainability-score")
              .map((field) => (
                <motion.div
                  key={field.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg bg-card border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      {getMetricIcon(field.id)}
                    </div>
                    <span className="text-sm font-medium">{getMetricName(field.id)}</span>
                  </div>
                  <span className={`text-lg font-semibold ${getSustainabilityColor(field.id, field.value)}`}>
                    {getValueWithUnit(field.id, field.value)}
                  </span>
                </motion.div>
            ))}
          </div>
          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{t('progress')}</span>
              <span className="text-sm font-medium">{calculateOverallProgress().toFixed(1)}%</span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 