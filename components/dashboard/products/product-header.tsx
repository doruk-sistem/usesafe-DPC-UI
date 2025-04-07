"use client";

import { Download, Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("productManagement");

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
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <Input
          placeholder={t("search.placeholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-[200px]"
        />

        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t("filters.type.label")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.type.all")}</SelectItem>
            <SelectItem value="agm">{t("filters.type.agm")}</SelectItem>
            <SelectItem value="efb">{t("filters.type.efb")}</SelectItem>
            <SelectItem value="standard">{t("filters.type.standard")}</SelectItem>
            <SelectItem value="marine">{t("filters.type.marine")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">All Statuses</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" title={t("actions.download")}>
          <Download className="h-4 w-4" />
        </Button>

        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.addProduct")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
