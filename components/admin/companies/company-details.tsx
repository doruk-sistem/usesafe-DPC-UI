"use client";

import { useEffect, useState } from "react";
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
import { supabase } from '@/lib/supabase/client'; // Supabase client'ınızı import edin
import { CompanyService } from "@/lib/services/company";

interface CompanyDetailsProps {
  companyId: string;
}

// Örnek veri tipi
interface CompanyStats {
  total: number;
  active: number;
  pending: number;
  categories: Array<{ name: string; count: number }>;
}

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  taxInfo: {
    taxNumber: string;
    tradeRegistryNo: string;
    mersisNo: string;
  };
  address: {
    street: string;
    district: string;
    city: string;
    postalCode: string;
    country: string;
  };
  contactPerson: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  productStats: CompanyStats;
}

export function CompanyDetails({ companyId }: CompanyDetailsProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("admin.companies.details");

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        // Şirket detaylarını al
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();

        if (companyError) throw companyError;

        // Ürün verilerini al
        const products = await CompanyService.getProducts(companyId);

        // Ürün istatistiklerini hesapla
        const total = products.length;
        const active = products.filter(p => p.status === 'active').length;
        const pending = products.filter(p => p.status === 'pending').length;
        const categories = products.reduce((acc, product) => {
          const category = acc.find(c => c.name === product.category);
          if (category) {
            category.count += 1;
          } else {
            acc.push({ name: product.category, count: 1 });
          }
          return acc;
        }, []);

        const statsData = { total, active, pending, categories };

        setCompany({ ...companyData, productStats: statsData });
      } catch (error) {
        console.error("Şirket detayları alınamadı:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [companyId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("loading")}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("error.title")}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!company.productStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hata: Ürün istatistikleri alınamadı.</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Ürün İstatistikleri
  const { total = 0, active = 0, pending = 0 } = company.productStats || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{company.name}</CardTitle>
            <CardDescription>Şirket Detayları ve İstatistikleri</CardDescription>
          </div>
          <Badge
            variant={company.status === "active" ? "success" : "secondary"}
            className="capitalize"
          >
            {company.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Ürün İstatistikleri */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Ürün İstatistikleri</h3>
            <Button variant="outline" asChild>
              <Link href={`/admin/companies/${company.id}?tab=products`}>
                <Package className="mr-2 h-4 w-4" />
                Tüm Ürünleri Görüntüle
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Toplam Ürün</p>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {company.productStats.total}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-muted-foreground">Aktif Ürün</p>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {company.productStats.active}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm text-muted-foreground">Bekleyen Ürün</p>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {company.productStats.pending}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Şirket Bilgileri */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("companyInfo.title")}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{company.type}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("taxInfo.title")}</h3>
            <div className="space-y-2">
              <p>
                <span className="text-muted-foreground">{t("taxInfo.taxNumber")}: </span>
                {company.taxInfo.taxNumber}
              </p>
              <p>
                <span className="text-muted-foreground">{t("taxInfo.tradeRegistryNo")}: </span>
                {company.taxInfo.tradeRegistryNo}
              </p>
              <p>
                <span className="text-muted-foreground">{t("taxInfo.mersisNo")}: </span>
                {company.taxInfo.mersisNo}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("addressInfo.title")}</h3>
            <div className="space-y-2">
              {company.address ? (
                <>
                  <p>{company.address.street}</p>
                  <p>
                    {company.address.district}, {company.address.city}{" "}
                    {company.address.postalCode}
                  </p>
                  <p>{company.address.country}</p>
                </>
              ) : (
                <p>{t("addressInfo.notAvailable")}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("contactPerson.title")}</h3>
            <div className="space-y-2">
              {company.contactPerson ? (
                <>
                  <p className="font-medium">{company.contactPerson.name}</p>
                  <p className="text-muted-foreground">
                    {company.contactPerson.position}
                  </p>
                  <p>{company.contactPerson.email}</p>
                  <p>{company.contactPerson.phone}</p>
                </>
              ) : (
                <p>{t("contactPerson.notAvailable")}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}