"use client";

import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { products } from "@/lib/data/products";

interface VerificationStatusProps {
  code: string;
}

export function VerificationStatus({ code }: VerificationStatusProps) {
  const router = useRouter();
  const t = useTranslations('verify');
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
          setError(t('status.invalid.notFound'));
        }
      } catch (error) {
        setStatus("invalid");
        setError(t('status.invalid.error'));
      }
    };

    validateCode();
  }, [code, router, t]);

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
                <h2 className="text-2xl font-semibold">{t('status.validating.title')}</h2>
                <p className="text-muted-foreground">
                  {t('status.validating.description')}
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
                <h2 className="text-2xl font-semibold">{t('status.valid.title')}</h2>
                <p className="text-muted-foreground">
                  {t('status.valid.description')}
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
                <h2 className="text-2xl font-semibold">{t('status.invalid.title')}</h2>
                <p className="text-red-500">{error}</p>
                <p className="text-muted-foreground">
                  {t('status.invalid.description')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/verify")}
                className="mt-4"
              >
                {t('status.invalid.button')}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}