"use client";

import { useState } from "react";
import { CertificationHeader } from "@/components/dashboard/certifications/certification-header";
import { CertificationList } from "@/components/dashboard/certifications/certification-list";

export default function CertificationsPage() {
  const [filters, setFilters] = useState({
    type: "all",
    status: "all-status"
  });

  const handleFilterChange = (key: 'type' | 'status', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <CertificationHeader onFilterChange={handleFilterChange} />
      <CertificationList filters={filters} />
    </div>
  );
}