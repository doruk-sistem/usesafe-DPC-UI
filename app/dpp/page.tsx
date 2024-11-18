import { Search } from "lucide-react";

import { DPPList } from "@/components/dpp/dpp-list";

export default function DPPPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col items-center text-center mb-10">
        <Search className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Digital Product Passports</h1>
        <p className="text-muted-foreground max-w-2xl">
          View detailed sustainability and lifecycle information for certified products
        </p>
      </div>
      <DPPList />
    </div>
  );
}