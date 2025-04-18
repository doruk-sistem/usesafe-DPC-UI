"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  className?: string;
  text?: string;
}

export function Loading({ className = "", text }: LoadingProps) {
  const t = useTranslations("common");
  const loadingText = text || t("loading");

  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      </div>
    </div>
  );
} 