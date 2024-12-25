"use client";

import { DPPForm } from "@/components/dashboard/dpps/dpp-form";
import { Card } from "@/components/ui/card";

export default function NewDPPPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Digital Product Passport</h1>
        <p className="text-sm text-muted-foreground">
          Generate a new DPP for an existing product
        </p>
      </div>

      <Card className="p-6">
        <DPPForm />
      </Card>
    </div>
  );
}