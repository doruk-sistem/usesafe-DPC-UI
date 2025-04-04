"use client";

import { Search } from 'lucide-react';
import { useTranslations } from "next-intl";

import { Input } from '@/components/ui/input';

interface ManufacturerSearchInputProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  placeholder?: string;
}

export function ManufacturerSearchInput({ 
  searchQuery, 
  onSearchQueryChange,
  placeholder 
}: ManufacturerSearchInputProps) {
  const t = useTranslations("productManagement.addProduct");

  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder || t("form.fields.manufacturer.placeholder")}
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
} 