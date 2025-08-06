"use client";

import { Suspense, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

import { DistributorHeader } from "@/components/dashboard/distributors/distributor-header";
import { DistributorList } from "@/components/dashboard/distributors/distributor-list";
import { DistributorFilters } from "@/lib/types/distributor";

export default function DistributorsPage() {
  const [filters, setFilters] = useState<DistributorFilters>({});
  const { toast } = useToast();

  const handleFiltersChange = (newFilters: DistributorFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const handleExport = () => {
    toast({
      title: "Export başlatıldı",
      description: "Distribütör listesi dışa aktarılıyor...",
    });
    // Export logic will be implemented here
  };

  const handleAddDistributor = () => {
    toast({
      title: "Distribütör ekleme",
      description: "Distribütör ekleme formu açılıyor...",
    });
    // Add distributor logic will be implemented here
  };

  return (
    <div className="space-y-6">
      <DistributorHeader
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onExport={handleExport}
        onAddDistributor={handleAddDistributor}
      />
      
      <Suspense fallback={<div>Distribütörler yükleniyor...</div>}>
        <DistributorList filters={filters} />
      </Suspense>
    </div>
  );
} 