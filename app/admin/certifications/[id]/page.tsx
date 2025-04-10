import { useTranslations } from "next-intl";

import { CertificationDetails } from "@/components/admin/certifications/certification-details";
import { CertificationDocuments } from "@/components/admin/certifications/certification-documents";
import { CertificationTabs } from "@/components/admin/certifications/certification-tabs";
import { CertificationTests } from "@/components/admin/certifications/certification-tests";

// Mock data for static params
const certifications = [
  { id: "DPC-001" },
  { id: "DPC-002" },
  { id: "DPC-003" },
];

export function generateStaticParams() {
  return certifications.map((certification) => ({
    id: certification.id,
  }));
}

export default function CertificationPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <CertificationDetails certificationId={params.id} />
      <CertificationTabs certificationId={params.id} />
    </div>
  );
}