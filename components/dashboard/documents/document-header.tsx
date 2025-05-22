"use client";

import { Download, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentHeaderProps {
  onFilterChange: (key: 'type' | 'status', value: string) => void;
}

export function DocumentHeader({ onFilterChange }: DocumentHeaderProps) {
  const t = useTranslations('documents');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>
      <div className="flex items-center gap-2">
        <Select 
          defaultValue="all"
          onValueChange={(value) => onFilterChange('type', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="signature_circular">İmza Dairesi</SelectItem>
            <SelectItem value="trade_registry_gazette">Ticaret Kayıt Gazetesi</SelectItem>
            <SelectItem value="tax_plate">Vergi Plakası</SelectItem>
            <SelectItem value="activity_certificate">Faaliyet Sertifikası</SelectItem>
            <SelectItem value="export_certificate">İhracat Sertifikası</SelectItem>
          </SelectContent>
        </Select>
        <Button asChild>
          <Link href="/dashboard/documents/upload">
            <Plus className="h-4 w-4 mr-2" />
            Yükle
          </Link>
        </Button>
      </div>
    </div>
  );
}