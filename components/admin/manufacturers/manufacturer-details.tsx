"use client";

import { ArrowLeft, Building2, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companyService } from "@/lib/services/company";
import type { Company } from "@/lib/types/company";

interface ManufacturerDetailsProps {
  manufacturerId: string;
}

export function ManufacturerDetails({ manufacturerId }: ManufacturerDetailsProps) {
  const t = useTranslations("adminDashboard.sections.manufacturers.details");
  const [manufacturer, setManufacturer] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function mapStatus(status: any) {
    if (status === true) return "approved";
    if (status === false) return "pending";
    return status;
  }

  useEffect(() => {
    const fetchManufacturer = async () => {
      try {
        const data = await companyService.getManufacturer(manufacturerId);
        setManufacturer(data);
      } catch (error) {
        console.error("Error fetching manufacturer:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchManufacturer();
  }, [manufacturerId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-8 w-[200px] animate-pulse bg-muted rounded" />
            <div className="h-4 w-[300px] animate-pulse bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!manufacturer) {
    return <div>{t("notFound")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/manufacturers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToList")}
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{manufacturer.name}</h1>
          <Badge
            variant={
              mapStatus(manufacturer.status) === "approved"
                ? "success"
                : mapStatus(manufacturer.status) === "rejected"
                ? "destructive"
                : "warning"
            }
          >
            {t(`status.${mapStatus(manufacturer.status)}`)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">{t("actions.reject")}</Button>
          <Button>{t("actions.approve")}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("companyInfo.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{manufacturer.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{manufacturer.phone}</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("companyInfo.address")}</p>
            {manufacturer.address?.headquarters && (
              <p>{manufacturer.address.headquarters}</p>
            )}
            {manufacturer.address?.factory && (
              <p>{manufacturer.address.factory}</p>
            )}
            {manufacturer.address?.branches && (
              <p>{manufacturer.address.branches}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("companyInfo.taxId")}</p>
            <p>{manufacturer.taxInfo?.taxNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("companyInfo.registrationDate")}</p>
            <p>
              {manufacturer.createdAt
                ? new Date(manufacturer.createdAt).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("verification.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>{t("verification.document")}</span>
              <Badge variant="warning">{t("verification.status.inProgress")}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("verification.taxId")}</span>
              <Badge variant="success">{t("verification.status.verified")}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("verification.address")}</span>
              <Badge variant="warning">{t("verification.status.pending")}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("verification.contact")}</span>
              <Badge variant="success">{t("verification.status.verified")}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}