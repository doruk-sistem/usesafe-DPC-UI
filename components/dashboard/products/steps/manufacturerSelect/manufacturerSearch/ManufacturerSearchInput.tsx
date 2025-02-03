"use client";

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ManufacturerSearchInputProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

export function ManufacturerSearchInput({ searchQuery, onSearchQueryChange }: ManufacturerSearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search manufacturers by name or tax ID..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
} 