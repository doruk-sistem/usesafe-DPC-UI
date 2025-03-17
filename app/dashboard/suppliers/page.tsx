"use client";

import { SupplierHeader } from "@/components/dashboard/suppliers/supplier-header";
import { SupplierList } from "@/components/dashboard/suppliers/supplier-list";

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <SupplierHeader />
      <SupplierList />
    </div>
  );
}