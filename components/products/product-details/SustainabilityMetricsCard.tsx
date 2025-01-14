"use client";

import { motion } from "framer-motion";
import { Leaf, Droplets, Zap, Recycle, Beaker, Sprout } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface SustainabilityMetricsCardProps {
  environmentalFields: Array<{
    id: string;
    name: string;
    value: string | number;
  }>;
  cardVariants: any;
}

export function SustainabilityMetricsCard({ 
  environmentalFields,
  cardVariants 
}: SustainabilityMetricsCardProps) {
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

  const sustainabilityScore = environmentalFields.find(f => f.id === "sustainability-score")?.value || 0;

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="lg:col-span-2"
    >
      <Card className="bg-gradient-to-br from-background to-muted">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Environmental Impact</CardTitle>
            </div>
            <Badge 
              variant={
                Number(sustainabilityScore) >= 80 ? "success" :
                Number(sustainabilityScore) >= 60 ? "warning" : "destructive"
              }
              className="text-lg px-4 py-1"
            >
              {sustainabilityScore}% Sustainable
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {environmentalFields
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
                    <span className="text-sm font-medium">{field.name}</span>
                  </div>
                  <span className={`text-lg font-semibold ${getSustainabilityColor(field.id, field.value)}`}>
                    {getValueWithUnit(field.id, field.value)}
                  </span>
                </motion.div>
            ))}
          </div>
          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Sustainability Progress</span>
              <span className="text-sm font-medium">{sustainabilityScore}%</span>
            </div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="w-full bg-muted rounded-full h-3"
            >
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${sustainabilityScore}%` }}
                transition={{ duration: 1 }}
                className={`h-full rounded-full ${
                  Number(sustainabilityScore) >= 80 ? "bg-green-500" :
                  Number(sustainabilityScore) >= 60 ? "bg-yellow-500" : "bg-red-500"
                }`}
              />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 