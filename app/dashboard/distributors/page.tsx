"use client";

import { Suspense, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

import { DistributorHeader } from "@/components/dashboard/distributors/distributor-header";
import { DistributorList } from "@/components/dashboard/distributors/distributor-list";
import { DistributorFilters } from "@/lib/types/distributor";

export default function DistributorsPage() {
  const [filters, setFilters] = useState<DistributorFilters>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    setIsAddModalOpen(true);
  };

  const handleAddSuccess = () => {
    // Invalidate distributor queries to refresh the list
    queryClient.invalidateQueries({ queryKey: ['getDistributors'] });
    queryClient.invalidateQueries({ queryKey: ['getDistributorStats'] });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <DistributorHeader
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onExport={handleExport}
        onAddDistributor={handleAddDistributor}
        isAddModalOpen={isAddModalOpen}
        onAddModalClose={() => setIsAddModalOpen(false)}
        onAddSuccess={handleAddSuccess}
      />
      
      <Suspense fallback={<div>Distribütörler yükleniyor...</div>}>
        <DistributorList filters={filters} onAddDistributor={handleAddDistributor} />
      </Suspense>
    </div>
  );
} 