"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";

const approvals = [
  {
    id: "MFR-001",
    type: "manufacturer",
    name: "TechFabrics Ltd",
    status: "pending",
    submitted: "2024-03-15T10:30:00",
  },
  {
    id: "DOC-023",
    type: "document",
    name: "ISO 9001 Certificate",
    status: "pending",
    submitted: "2024-03-15T09:45:00",
  },
  {
    id: "DPC-089",
    type: "dpc",
    name: "Organic Cotton T-Shirt",
    status: "pending",
    submitted: "2024-03-15T09:15:00",
  },
];

export function PendingApprovals() {
  const t = useTranslations("adminDashboard");

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          {t("sections.pendingApprovals.title")}
        </CardTitle>
        <CardDescription>{t("sections.pendingApprovals.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvals.map((approval, index) => (
            <motion.div
              key={approval.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors group/item"
            >
              <div className="space-y-1">
                <p className="font-medium">{approval.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t(`labels.${approval.type}`)}</Badge>
                  <span className="text-sm text-muted-foreground">{approval.id}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                asChild
              >
                <Link href={`/admin/${approval.type}s/${approval.id}`}>
                  {t("actions.review")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}