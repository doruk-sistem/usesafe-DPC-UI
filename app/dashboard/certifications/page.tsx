"use client";

import { CertificationList } from "@/components/dashboard/certifications/certification-list";
import { CertificationHeader } from "@/components/dashboard/certifications/certification-header";

export default function CertificationsPage() {
  return (
    <div className="space-y-6">
      <CertificationHeader />
      <CertificationList />
    </div>
  );
}