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

interface CertificationHeaderProps {
  onFilterChange: (key: 'type' | 'status', value: string) => void;
}

export function CertificationHeader({ onFilterChange }: CertificationHeaderProps) {
  const t = useTranslations('certifications');

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select 
          defaultValue="all"
          onValueChange={(value) => onFilterChange('type', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filters.type.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.type.all')}</SelectItem>
            <SelectItem value="quality_certificate">{t('filters.type.quality')}</SelectItem>
            <SelectItem value="iso_certificate">{t('filters.type.iso')}</SelectItem>
            <SelectItem value="production_permit">{t('filters.type.production')}</SelectItem>
            <SelectItem value="export_certificate">{t('filters.type.export')}</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          defaultValue="all-status"
          onValueChange={(value) => onFilterChange('status', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filters.status.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">{t('filters.status.all')}</SelectItem>
            <SelectItem value="pending">{t('filters.status.pending')}</SelectItem>
            <SelectItem value="approved">{t('filters.status.approved')}</SelectItem>
            <SelectItem value="rejected">{t('filters.status.rejected')}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="/dashboard/certifications/new">
            <Plus className="h-4 w-4 mr-2" />
            {t('actions.new')}
          </Link>
        </Button>
      </div>
    </div>
  );
}