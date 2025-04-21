"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { CompanyService } from "@/lib/services/company";
import type { Company } from "@/lib/types/company";

import { QuickManufacturerForm } from "../QuickManufacturerForm";
import { SelectedManufacturerCard } from "../SelectedManufacturerCard";

import { ManufacturerSearchInput } from "./ManufacturerSearchInput";
import { ManufacturerSearchResults } from "./ManufacturerSearchResults";

interface ManufacturerSearchProps {
  value: string | null;
  onChange: (manufacturerId: string | null) => void;
  placeholder?: string;
}

export function ManufacturerSearch({
  value,
  onChange,
  placeholder,
}: ManufacturerSearchProps) {
  const { toast } = useToast();
  const t = useTranslations("productManagement.addProduct");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [manufacturers, setManufacturers] = useState<Company[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<Company | null>(null);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setManufacturers([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await CompanyService.searchManufacturers(query);
      setManufacturers(results);
      if (results.length === 0) {
        setShowQuickForm(true);
      } else {
        setShowQuickForm(false);
      }
    } catch (error) {
      console.error("Error searching manufacturers:", error);
      toast({
        title: "Error",
        description: "Failed to search manufacturers",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    handleSearch(debouncedSearch);
  }, [debouncedSearch]);

  const handleSelectManufacturer = (manufacturer: Company) => {
    onChange(manufacturer.id);
    setSelectedManufacturer(manufacturer);
    setSearchQuery("");
    setManufacturers([]);
  };

  const handleClearSelection = () => {
    onChange(null);
    setSelectedManufacturer(null);
  };

  const handleQuickFormSuccess = (manufacturer: Company) => {
    onChange(manufacturer.id);
    setSelectedManufacturer(manufacturer);
    setShowQuickForm(false);
    setSearchQuery("");
  };

  return (
    <div className="space-y-2">
      <ManufacturerSearchInput
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        placeholder={placeholder}
      />
      {isSearching ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <span className="text-sm text-muted-foreground">
                {t("form.fields.manufacturer.searching")}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : manufacturers.length > 0 ? (
        <ManufacturerSearchResults
          manufacturers={manufacturers}
          value={value}
          onSelect={handleSelectManufacturer}
        />
      ) : searchQuery && showQuickForm ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.manufacturer.noResults")}
                </span>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("form.fields.manufacturer.addNew")}
                </p>
              </div>
              <QuickManufacturerForm
                onSuccess={handleQuickFormSuccess}
                onCancel={() => {
                  setShowQuickForm(false);
                  setSearchQuery("");
                }}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}
      {selectedManufacturer && !searchQuery && (
        <SelectedManufacturerCard
          manufacturer={selectedManufacturer}
          onClear={handleClearSelection}
        />
      )}
    </div>
  );
}
