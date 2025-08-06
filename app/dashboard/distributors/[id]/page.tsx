"use client";

import { Suspense } from "react";
import { ArrowLeft, Truck, Mail, Phone, Globe, MapPin, Building2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDistributor } from "@/lib/hooks/use-distributors";

export default function DistributorDetailsPage() {
  const params = useParams();
  const distributorId = params.id as string;
  const t = useTranslations("distributors");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/distributors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("details.title")}</h1>
            <p className="text-muted-foreground">{t("details.description")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/distributors/${distributorId}/edit`}>
              {t("details.actions.edit")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/distributors/${distributorId}/products`}>
              {t("details.actions.viewProducts")}
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<DistributorDetailsSkeleton />}>
        <DistributorDetails distributorId={distributorId} />
      </Suspense>
    </div>
  );
}

function DistributorDetails({ distributorId }: { distributorId: string }) {
  const { distributor, isLoading, error } = useDistributor(distributorId);
  const t = useTranslations("distributors");

  if (isLoading) {
    return <DistributorDetailsSkeleton />;
  }

  if (error || !distributor) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("details.error.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("details.error.description")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Temel Bilgiler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("details.basicInfo.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("details.basicInfo.name")}
            </label>
            <p className="text-lg font-semibold">{distributor.name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("details.basicInfo.taxNumber")}
            </label>
            <p className="font-mono text-sm">{distributor.taxInfo.taxNumber}</p>
          </div>

          {distributor.taxInfo.tradeRegistryNo && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("details.basicInfo.tradeRegistryNo")}
              </label>
              <p className="font-mono text-sm">{distributor.taxInfo.tradeRegistryNo}</p>
            </div>
          )}

          {distributor.taxInfo.mersisNo && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("details.basicInfo.mersisNo")}
              </label>
              <p className="font-mono text-sm">{distributor.taxInfo.mersisNo}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* İletişim Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t("details.contactInfo.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {distributor.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("details.contactInfo.email")}
                </label>
                <p className="text-sm">{distributor.email}</p>
              </div>
            </div>
          )}

          {distributor.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("details.contactInfo.phone")}
                </label>
                <p className="text-sm">{distributor.phone}</p>
              </div>
            </div>
          )}

          {distributor.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("details.contactInfo.website")}
                </label>
                <a 
                  href={distributor.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {distributor.website}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adres Bilgileri */}
      {(distributor.address?.headquarters || distributor.address?.branches) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("details.addressInfo.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {distributor.address?.headquarters && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("details.addressInfo.headquarters")}
                </label>
                <p className="text-sm">{distributor.address.headquarters}</p>
              </div>
            )}

            {distributor.address?.branches && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("details.addressInfo.branches")}
                </label>
                <p className="text-sm">{distributor.address.branches}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* İstatistikler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {t("details.stats.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {t("details.stats.assignedProducts")}
            </span>
            <Badge variant="outline">
              {distributor.assignedProducts || 0}
            </Badge>
          </div>

          {distributor.createdAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t("details.stats.createdAt")}
              </span>
              <span className="text-sm">{formatDate(distributor.createdAt)}</span>
            </div>
          )}

          {distributor.updatedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t("details.stats.updatedAt")}
              </span>
              <span className="text-sm">{formatDate(distributor.updatedAt)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DistributorDetailsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j}>
                <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-5 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 