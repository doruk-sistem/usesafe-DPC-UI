"use client";

import { Download, Search, Filter, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DistributorFilters } from "@/lib/types/distributor";
import { AddDistributorModal } from "./add-distributor-modal";

interface DistributorHeaderProps {
  onFiltersChange: (filters: DistributorFilters) => void;
  onSearch: (query: string) => void;
  onExport: () => void;
  onAddDistributor: () => void;
  isAddModalOpen: boolean;
  onAddModalClose: () => void;
  onAddSuccess: () => void;
}

export function DistributorHeader({
  onFiltersChange,
  onSearch,
  onExport,
  onAddDistributor,
  isAddModalOpen,
  onAddModalClose,
  onAddSuccess,
}: DistributorHeaderProps) {
  const t = useTranslations("distributors");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<DistributorFilters>({});

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof DistributorFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-");
    const newFilters = { ...filters, sortBy: sortBy as any, sortOrder: sortOrder as any };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-[200px]"
          />
        </div>

        {/* Sort */}
        <Select
          value={`${filters.sortBy || "name"}-${filters.sortOrder || "asc"}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t("filters.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">{t("sort.nameAsc")}</SelectItem>
            <SelectItem value="name-desc">{t("sort.nameDesc")}</SelectItem>
            <SelectItem value="assignedProducts-desc">{t("sort.productsDesc")}</SelectItem>
            <SelectItem value="assignedProducts-asc">{t("sort.productsAsc")}</SelectItem>
            <SelectItem value="createdAt-desc">{t("sort.newest")}</SelectItem>
            <SelectItem value="createdAt-asc">{t("sort.oldest")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Export Button */}
        <Button variant="outline" size="icon" onClick={onExport} title={t("actions.export")}>
          <Download className="h-4 w-4" />
        </Button>

        {/* Add Distributor Button */}
        <Button onClick={onAddDistributor}>
          <Plus className="h-4 w-4 mr-2" />
          {t("actions.addDistributor")}
        </Button>
      </div>

      {/* Add Distributor Modal */}
      <AddDistributorModal
        isOpen={isAddModalOpen}
        onClose={onAddModalClose}
        onSuccess={onAddSuccess}
      />
    </div>
  );
} 