"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DocumentHeader } from "@/components/dashboard/documents/document-header";
import { DocumentList } from "@/components/dashboard/documents/document-list";

export default function DocumentsPage() {
  const router = useRouter();
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
      <DocumentHeader onFilterChange={handleFilterChange} />
      <DocumentList filters={filters} />
    </div>
  );
}