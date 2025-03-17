import { CertificationHeader } from "@/components/admin/certifications/certification-header";
import { CertificationList } from "@/components/admin/certifications/certification-list";

export default function CertificationsPage() {
  return (
    <div className="space-y-6">
      <CertificationHeader />
      <CertificationList />
    </div>
  );
}