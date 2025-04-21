"use client";

import { DPPHeader } from "@/components/dashboard/dpps/dpp-header";
import { DPPList } from "@/components/dashboard/dpps/dpp-list";
import { useDPPs } from "@/lib/hooks/use-dpps";

export default function DPPsPage() {
  const { dpps, isLoading, error } = useDPPs();

  return (
    <div className="space-y-6">
      <DPPHeader />
      <DPPList dpps={dpps} isLoading={isLoading} error={error} />
    </div>
  );
}
