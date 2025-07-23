"use client";

import { useQuery } from "@tanstack/react-query";
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
import { supabase } from "@/lib/supabase/client";

interface Material {
  id: string;
  name: string;
  percentage: number;
  recyclable: boolean;
  description: string;
}

interface MaterialsCardProps {
  title: string;
  productId: string;
}

export function MaterialsCard({ 
  title,
  productId
}: MaterialsCardProps) {
  const t = useTranslations("products.details.materials");

  // Fetch materials from product_materials table
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["product-materials", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_materials")
        .select("id, name, percentage, recyclable, description")
        .eq("product_id", productId)
        .order("percentage", { ascending: false });

      if (error) {
        console.error("Error fetching materials:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("loading") || "Loading materials..."}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("noMaterials") || "No materials found for this product."}
          </div>
        </CardContent>
      </Card>
    );
  }

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
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
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