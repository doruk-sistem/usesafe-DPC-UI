"use client";

import { motion } from "framer-motion";
import { Box } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BasicInformationCardProps {
  basicInfo: {
    [key: string]: string;
  };
  cardVariants: any;
}

export function BasicInformationCard({ 
  basicInfo, 
  cardVariants 
}: BasicInformationCardProps) {
  return (
    <motion.div 
      variants={cardVariants}
      whileHover="hover"
    >
      <Card className="bg-gradient-to-br from-background to-muted shadow-lg card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(basicInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <dt className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </dt>
                <dd className="text-sm text-primary">{value}</dd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 