"use client";

import { DPPHeader } from "@/components/dashboard/dpps/dpp-header";
import { DPPList } from "@/components/dashboard/dpps/dpp-list";

export default function DPPsPage() {
  return (
    <div className="space-y-6">
      <DPPHeader />
      <DPPList />
    </div>
  );
}
