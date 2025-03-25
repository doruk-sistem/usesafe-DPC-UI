"use client";

import { Download, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductHeaderProps {
  onSearch?: (term: string) => void;
  onFilterChange?: (filter: string) => void;
  onStatusChange?: (status: string) => void;
}

export function ProductHeader({
  onSearch,
  onFilterChange,
  onStatusChange,
}: ProductHeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState("all-status");

  const isInitialRender = useRef(true);

  
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

 
  const handleFilterChange = (value: string) => {
    setFilter(value);
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  
  const handleStatusChange = (value: string) => {
    setStatus(value);
    if (onStatusChange) {
      onStatusChange(value);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h1 className="text-2xl font-semibold">Product Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage your battery products and DPPs
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
      
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-[200px]"
        />

        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="agm">AGM Batteries</SelectItem>
            <SelectItem value="efb">EFB Batteries</SelectItem>
            <SelectItem value="standard">Standard Batteries</SelectItem>
            <SelectItem value="marine">Marine Batteries</SelectItem>
          </SelectContent>
        </Select>

       
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending DPC</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

  
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>

    
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>
    </div>
  );
}
