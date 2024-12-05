"use client";

import { motion } from "framer-motion";

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
  materials: Material[];
  itemVariants: any;
}

export function MaterialsCard({ 
  materials, 
  itemVariants 
}: MaterialsCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Materials</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div variants={itemVariants}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Recyclable</TableHead>
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
        </motion.div>
      </CardContent>
    </Card>
  );
} 