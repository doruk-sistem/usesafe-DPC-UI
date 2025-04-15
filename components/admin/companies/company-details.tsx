"use client";

import { Package, CheckCircle, Clock, Building2, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useCompany } from "@/lib/hooks/use-company";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CompanyDetailsProps {
  companyId: string;
}

export function CompanyDetails({ companyId }: CompanyDetailsProps) {
  const t = useTranslations("admin.companies.details");
  const { company, isLoading, error } = useCompany(companyId);
  
  if (!companyId) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Company ID is required
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-5 w-[100px]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[180px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load company details. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            No company found with the provided ID.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{company.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={company.status === "active" ? "default" : "secondary"}>
              {company.status}
            </Badge>
            <Badge variant="outline">{company.companyType}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{company.taxInfo.taxNumber}</span>
            </div>
            {company.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{company.email}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{company.phone}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
