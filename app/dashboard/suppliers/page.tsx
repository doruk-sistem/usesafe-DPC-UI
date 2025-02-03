"use client";

import { SupplierList } from "@/components/dashboard/suppliers/supplier-list";
import { SupplierHeader } from "@/components/dashboard/suppliers/supplier-header";

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <SupplierHeader />
      <SupplierList />
    </div>
  );
}