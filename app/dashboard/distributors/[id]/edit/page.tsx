"use client";

import { useState } from "react";
import { ArrowLeft, Save, Truck, Mail, Phone, Globe, MapPin, Building2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useDistributor } from "@/lib/hooks/use-distributors";
import { DistributorService } from "@/lib/services/distributor";
import type { Distributor } from "@/lib/types/distributor";

export default function DistributorEditPage() {
  const params = useParams();
  const router = useRouter();
  const distributorId = params.id as string;
  const t = useTranslations("distributors");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { distributor, isLoading, error } = useDistributor(distributorId);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Distributor>>({});

  // Form verilerini başlat
  if (distributor && Object.keys(formData).length === 0) {
    setFormData({
      name: distributor.name,
      email: distributor.email,
      phone: distributor.phone,
      website: distributor.website,
      taxInfo: distributor.taxInfo,
      address: distributor.address,
    });
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTaxInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      taxInfo: {
        ...prev.taxInfo,
        [field]: value,
      } as any,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Veritabanı formatına dönüştür
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        tax_info: formData.taxInfo,
        address: formData.address,
      };

      const { error } = await DistributorService.updateDistributor(distributorId, updateData);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: t("edit.success.title"),
        description: t("edit.success.description"),
      });

      // Cache'i temizle
      queryClient.invalidateQueries({ queryKey: ['getDistributor', distributorId] });
      queryClient.invalidateQueries({ queryKey: ['getDistributors'] });

      // Detay sayfasına yönlendir
      router.push(`/dashboard/distributors/${distributorId}`);
    } catch (error) {
      toast({
        title: t("edit.error.title"),
        description: error instanceof Error ? error.message : t("edit.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <DistributorEditSkeleton />;
  }

  if (error || !distributor) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("edit.error.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("edit.error.description")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/distributors/${distributorId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("edit.title")}</h1>
            <p className="text-muted-foreground">{t("edit.description")}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("edit.basicInfo.title")}
            </CardTitle>
            <CardDescription>{t("edit.basicInfo.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("edit.basicInfo.name")} *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={t("edit.basicInfo.namePlaceholder")}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxNumber">{t("edit.basicInfo.taxNumber")} *</Label>
                <Input
                  id="taxNumber"
                  value={formData.taxInfo?.taxNumber || ""}
                  onChange={(e) => handleTaxInfoChange("taxNumber", e.target.value)}
                  placeholder={t("edit.basicInfo.taxNumberPlaceholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradeRegistryNo">{t("edit.basicInfo.tradeRegistryNo")}</Label>
                <Input
                  id="tradeRegistryNo"
                  value={formData.taxInfo?.tradeRegistryNo || ""}
                  onChange={(e) => handleTaxInfoChange("tradeRegistryNo", e.target.value)}
                  placeholder={t("edit.basicInfo.tradeRegistryNoPlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mersisNo">{t("edit.basicInfo.mersisNo")}</Label>
              <Input
                id="mersisNo"
                value={formData.taxInfo?.mersisNo || ""}
                onChange={(e) => handleTaxInfoChange("mersisNo", e.target.value)}
                placeholder={t("edit.basicInfo.mersisNoPlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        {/* İletişim Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("edit.contactInfo.title")}
            </CardTitle>
            <CardDescription>{t("edit.contactInfo.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("edit.contactInfo.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder={t("edit.contactInfo.emailPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("edit.contactInfo.phone")}</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder={t("edit.contactInfo.phonePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">{t("edit.contactInfo.website")}</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ""}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder={t("edit.contactInfo.websitePlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Adres Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("edit.addressInfo.title")}
            </CardTitle>
            <CardDescription>{t("edit.addressInfo.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headquarters">{t("edit.addressInfo.headquarters")}</Label>
              <Textarea
                id="headquarters"
                value={formData.address?.headquarters || ""}
                onChange={(e) => handleAddressChange("headquarters", e.target.value)}
                placeholder={t("edit.addressInfo.headquartersPlaceholder")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branches">{t("edit.addressInfo.branches")}</Label>
              <Textarea
                id="branches"
                value={formData.address?.branches || ""}
                onChange={(e) => handleAddressChange("branches", e.target.value)}
                placeholder={t("edit.addressInfo.branchesPlaceholder")}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kaydet Butonu */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/distributors/${distributorId}`}>
              {t("edit.actions.cancel")}
            </Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? t("edit.actions.saving") : t("edit.actions.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}

function DistributorEditSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-muted animate-pulse rounded" />
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 