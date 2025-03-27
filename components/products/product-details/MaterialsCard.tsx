"use client";

import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('product.details');

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('materials.title')}</TableHead>
              <TableHead>{t('materials.percentage')}</TableHead>
              <TableHead>{t('materials.recyclable')}</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material, index) => (
              <TableRow key={index}>
                <TableCell>{material.name}</TableCell>
                <TableCell>{material.percentage}%</TableCell>
                <TableCell>
                  <Badge variant={material.recyclable ? "success" : "secondary"}>
                    {material.recyclable ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>{material.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 