import { Download, Plus, Filter } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DPPHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Digital Product Passports</h1>
        <p className="text-sm text-muted-foreground">
          Manage your product DPPs and track manufacturing information
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="agm">AGM Batteries</SelectItem>
            <SelectItem value="efb">EFB Batteries</SelectItem>
            <SelectItem value="standard">Standard Batteries</SelectItem>
            <SelectItem value="marine">Marine Batteries</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="/dashboard/dpps/new">
            <Plus className="h-4 w-4 mr-2" />
            Create DPP
          </Link>
        </Button>
      </div>
    </div>
  );
}