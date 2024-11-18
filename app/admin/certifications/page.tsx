import { CertificationList } from "@/components/admin/certifications/certification-list";
import { CertificationHeader } from "@/components/admin/certifications/certification-header";

export default function CertificationsPage() {
  return (
    <div className="space-y-6">
      <CertificationHeader />
      <CertificationList />
    </div>
  );
}