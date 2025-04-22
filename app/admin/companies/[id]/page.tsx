"use client";

import { useTranslations } from "next-intl";
import { use } from "react";

import { CompanyDetails } from "@/components/admin/companies/company-details";
import { CompanyDocuments } from "@/components/admin/companies/company-documents";
import { CompanyProducts } from "@/components/admin/companies/company-products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompany } from "@/lib/hooks/use-company";

interface CompanyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CompanyPage({ params }: CompanyPageProps) {
  const resolvedParams = use(params);
  const t = useTranslations("dashboard.menu");

  return (
    <div className="space-y-6">
      <CompanyDetails companyId={resolvedParams.id} />
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">{t("products")}</TabsTrigger>
          <TabsTrigger value="documents">{t("documents")}</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="space-y-4">
          <CompanyProducts companyId={resolvedParams.id} />
        </TabsContent>
        <TabsContent value="documents" className="space-y-4">
          <CompanyDocuments companyId={resolvedParams.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}