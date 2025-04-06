"use client";

import { ArrowLeft, Building2, Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - In a real app, this would come from an API
const manufacturersData = {
  "MFR-001": {
    id: "MFR-001",
    name: "TechFabrics Ltd",
    status: "pending",
    details: {
      email: "contact@techfabrics.com",
      phone: "+90 555 123 4567",
      address: "123 Innovation Street, Tech District",
      city: "Istanbul",
      country: "Turkey",
      taxId: "1234567890",
      registrationDate: "2024-03-15T10:30:00",
    },
  },
  "MFR-002": {
    id: "MFR-002",
    name: "EcoTextiles Co",
    status: "approved",
    details: {
      email: "info@ecotextiles.com",
      phone: "+90 555 987 6543",
      address: "456 Green Avenue, Eco District",
      city: "Ankara",
      country: "Turkey",
      taxId: "0987654321",
      registrationDate: "2024-03-14T15:45:00",
    },
  },
  "MFR-003": {
    id: "MFR-003",
    name: "Sustainable Wear",
    status: "rejected",
    details: {
      email: "hello@sustainablewear.com",
      phone: "+90 555 456 7890",
      address: "789 Sustainable Street, Green Zone",
      city: "Izmir",
      country: "Turkey",
      taxId: "5678901234",
      registrationDate: "2024-03-13T09:15:00",
    },
  },
};

interface ManufacturerDetailsProps {
  manufacturerId: string;
}

export function ManufacturerDetails({ manufacturerId }: ManufacturerDetailsProps) {
  const t = useTranslations("adminDashboard.sections.manufacturers.details");
  const manufacturer = manufacturersData[manufacturerId];

  if (!manufacturer) {
    return <div>Manufacturer not found</div>;
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
              manufacturer.status === "approved"
                ? "success"
                : manufacturer.status === "rejected"
                ? "destructive"
                : "warning"
            }
          >
            {t(`status.${manufacturer.status}`)}
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
            <span>{manufacturer.details.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{manufacturer.details.phone}</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("companyInfo.address")}</p>
            <p>{manufacturer.details.address}</p>
            <p>
              {manufacturer.details.city}, {manufacturer.details.country}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("companyInfo.taxId")}</p>
            <p>{manufacturer.details.taxId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("companyInfo.registrationDate")}</p>
            <p>
              {new Date(manufacturer.details.registrationDate).toLocaleDateString()}
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