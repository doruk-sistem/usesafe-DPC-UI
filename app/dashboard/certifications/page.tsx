"use client";

import { CertificationHeader } from "@/components/dashboard/certifications/certification-header";
import { CertificationList } from "@/components/dashboard/certifications/certification-list";

export default function CertificationsPage() {
  return (
    <div className="space-y-6">
      <CertificationHeader />
      <CertificationList />
    </div>
  );
}