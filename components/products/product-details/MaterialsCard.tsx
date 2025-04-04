"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Material {
  name: string;
  percentage: number;
  recyclable: boolean;
  description: string;
}

interface MaterialsCardProps {
  title: string;
  materials: Material[];
}

export function MaterialsCard({ 
  title,
  materials
}: MaterialsCardProps) {
  const t = useTranslations("products.details.materials");

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.material")}</TableHead>
                <TableHead>{t("table.percentage")}</TableHead>
                <TableHead>{t("table.recyclable")}</TableHead>
                <TableHead>{t("table.description")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material, index) => (
                <TableRow key={index}>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>{material.percentage}%</TableCell>
                  <TableCell>
                    <Badge variant={material.recyclable ? "success" : "secondary"}>
                      {material.recyclable ? t("recyclable.yes") : t("recyclable.no")}
                    </Badge>
                  </TableCell>
                  <TableCell>{material.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </CardContent>
    </Card>
  );
} 