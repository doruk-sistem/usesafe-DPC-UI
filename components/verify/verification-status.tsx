"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { products } from "@/lib/data/products";

interface VerificationStatusProps {
  code: string;
}

export function VerificationStatus({ code }: VerificationStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"validating" | "valid" | "invalid">("validating");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const validateCode = async () => {
      try {
        // Simulate API validation delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if product exists in our database
        const productExists = products.some(product => product.id === code);

        if (productExists) {
          setStatus("valid");
          // Add slight delay before redirect for better UX
          setTimeout(() => {
            router.push(`/products/${code}`);
          }, 1000);
        } else {
          setStatus("invalid");
          setError("Product not found in our database");
        }
      } catch (error) {
        setStatus("invalid");
        setError("Failed to validate product code");
      }
    };

    validateCode();
  }, [code, router]);

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-6">
          {status === "validating" && (
            <>
              <div className="relative">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Validating Product</h2>
                <p className="text-muted-foreground">
                  Please wait while we verify the product authenticity...
                </p>
              </div>
            </>
          )}

          {status === "valid" && (
            <>
              <div className="relative">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-green-500/10" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Product Verified</h2>
                <p className="text-muted-foreground">
                  Redirecting to product details...
                </p>
              </div>
            </>
          )}

          {status === "invalid" && (
            <>
              <div className="relative">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-red-500/10" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Validation Failed</h2>
                <p className="text-red-500">{error}</p>
                <p className="text-muted-foreground">
                  The product code could not be verified. Please try again or contact support.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/verify")}
                className="mt-4"
              >
                Try Again
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}