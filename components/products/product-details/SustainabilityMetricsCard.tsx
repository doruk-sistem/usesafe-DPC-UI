"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SustainabilityMetricsCardProps {
  sustainabilityScore: number;
  carbonFootprint: string;
  cardVariants: any;
}

export function SustainabilityMetricsCard({ 
  sustainabilityScore, 
  carbonFootprint, 
  cardVariants 
}: SustainabilityMetricsCardProps) {
  return (
    <motion.div 
      variants={cardVariants}
      whileHover="hover"
      className="lg:col-span-2"
    >
      <Card>
        <CardHeader>
          <CardTitle>Sustainability Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Sustainability Score</span>
              <Badge
                variant={
                  sustainabilityScore >= 80 ? "success" :
                  sustainabilityScore >= 60 ? "warning" : "destructive"
                }
              >
                {sustainabilityScore}%
              </Badge>
            </div>
            <Progress value={sustainabilityScore} className="h-2" />
          </div>
          <div>
            <span className="font-medium">Carbon Footprint</span>
            <p className="text-muted-foreground">{carbonFootprint}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 