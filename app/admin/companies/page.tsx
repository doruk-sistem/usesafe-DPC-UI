import { CompanyHeader } from "@/components/admin/companies/company-header";
import { CompanyList } from "@/components/admin/companies/company-list";
import { useTranslations } from "next-intl";
export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <CompanyHeader />
      <CompanyList />
    </div>
  );
}