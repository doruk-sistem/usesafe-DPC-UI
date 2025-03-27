"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmergencyProceduresCardProps {
  title: string;
  procedures: string[];
}

export function EmergencyProceduresCard({ 
  title,
  procedures
}: EmergencyProceduresCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 list-disc pl-6">
          {procedures.map((procedure, index) => (
            <li key={index} className="text-muted-foreground">
              {procedure}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 