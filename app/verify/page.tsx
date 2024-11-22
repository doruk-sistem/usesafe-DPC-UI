"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ManualInput } from "@/components/verify/manual-input";
import { QRScanner } from "@/components/verify/qr-scanner";

export default function VerifyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [manualInput, setManualInput] = useState("");

  const handleProductCode = (code: string) => {
    // Validate product code format (example: PROD-2024-XXX)
    const isValid = /^PROD-\d{4}-\d{3}$/.test(code);

    if (isValid) {
      router.push(`/products/${code}`);
    } else {
      toast({
        title: "Invalid Product Code",
        description: "Please enter a valid product code or scan a valid QR code.",
        variant: "destructive",
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProductCode(manualInput);
  };

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <Search className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Verify Product</h1>
        <p className="text-muted-foreground">
          Enter a product ID or scan a QR code to verify its authenticity and view its Digital Product Passport.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ManualInput
            value={manualInput}
            onChange={setManualInput}
            onSubmit={handleManualSubmit}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or scan QR code
              </span>
            </div>
          </div>

          <QRScanner onScan={handleProductCode} />
        </CardContent>
      </Card>
    </div>
  );
}