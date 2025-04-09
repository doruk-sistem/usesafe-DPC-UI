import { getTranslations } from "next-intl/server";
import { CompanyDetails } from "@/components/admin/companies/company-details";
import { CompanyDocuments } from "@/components/admin/companies/company-documents";
import { CompanyProducts } from "@/components/admin/companies/company-products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export default async function CompanyPage({ params }: { params: { id: string } }) {
  const t = await getTranslations("dashboard.menu");
  const companyId = await params.id;

  return (
    <div className="space-y-6">
      <CompanyDetails companyId={companyId} />
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">{t("products")}</TabsTrigger>
          <TabsTrigger value="documents">{t("documents")}</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="space-y-4">
          <CompanyProducts companyId={companyId} />
        </TabsContent>
        <TabsContent value="documents" className="space-y-4">
          <CompanyDocuments companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}