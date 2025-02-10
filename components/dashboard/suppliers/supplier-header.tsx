"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SupplierHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your company's suppliers
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="manufacturer">Manufacturers</SelectItem>
            <SelectItem value="material_supplier">Material Suppliers</SelectItem>
            <SelectItem value="factory">Factories</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}