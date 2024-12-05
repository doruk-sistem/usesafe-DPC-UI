"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Certification {
  name: string;
  issuedBy: string;
  validUntil: string;
  status: "valid" | "expired";
  documentUrl?: string;
}

interface CertificationsCardProps {
  certifications: Certification[];
  itemVariants: any;
}

export function CertificationsCard({ 
  certifications, 
  itemVariants 
}: CertificationsCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div variants={itemVariants}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certification</TableHead>
                <TableHead>Issued By</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Document</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certifications.map((cert, index) => (
                <TableRow key={index}>
                  <TableCell>{cert.name}</TableCell>
                  <TableCell>{cert.issuedBy}</TableCell>
                  <TableCell>{new Date(cert.validUntil).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={cert.status === "valid" ? "success" : "destructive"}>
                      {cert.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {cert.documentUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={cert.documentUrl}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </CardContent>
    </Card>
  );
} 