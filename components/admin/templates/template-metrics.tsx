"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DPPTemplate } from "@/lib/types/dpp";

interface TemplateMetricsProps {
  templates: DPPTemplate[];
}

export function TemplateMetrics({ templates }: TemplateMetricsProps) {
  const totalTemplates = templates.length;
  const productTypes = new Set(templates.map(t => t.product_type)).size;
  const totalCertifications = templates.reduce((acc, t) => 
    acc + t.required_certifications.length + t.optional_certifications.length, 0);
  const avgMaterials = Math.round(
    templates.length ? templates.reduce((acc, t) => acc + t.materials.length, 0) / totalTemplates : 0
  );

  const metrics = [
    {
      title: "Total Templates",
      value: totalTemplates,
      icon: FileText,
      description: "Active DPP templates",
      color: "text-blue-500"
    },
    {
      title: "Product Types",
      value: productTypes,
      icon: CheckCircle,
      description: "Unique product categories",
      color: "text-green-500"
    },
    {
      title: "Total Certifications",
      value: totalCertifications,
      icon: AlertTriangle,
      description: "Required & optional",
      color: "text-yellow-500"
    },
    {
      title: "Avg. Materials",
      value: avgMaterials,
      icon: Clock,
      description: "Per template",
      color: "text-purple-500"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}