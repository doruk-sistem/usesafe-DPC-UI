"use client";

import { DPPList } from "@/components/dashboard/dpps/dpp-list";
import { DPPHeader } from "@/components/dashboard/dpps/dpp-header";

export default function DPPsPage() {
  return (
    <div className="space-y-6">
      <DPPHeader />
      <DPPList />
    </div>
  );
}