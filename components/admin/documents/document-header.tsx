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
  filters: {
    type: string;
    status: string;
  };
}

export function DocumentHeader({ onFilterChange, filters }: DocumentHeaderProps) {
  const t = useTranslations("documentManagement");
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select 
          value={filters.type} 
          onValueChange={(value) => onFilterChange('type', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allDocuments")}</SelectItem>
            <SelectItem value="signature_circular">İmza Dairesi</SelectItem>
            <SelectItem value="trade_registry_gazette">Ticaret Kayıt Gazetesi</SelectItem>
            <SelectItem value="tax_plate">Vergi Plakası</SelectItem>
            <SelectItem value="activity_certificate">Faaliyet Sertifikası</SelectItem>
            <SelectItem value="export_certificate">İhracat Sertifikası</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.status}
          onValueChange={(value) => onFilterChange('status', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filters.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">{t("filters.allStatuses")}</SelectItem>
            <SelectItem value="pending">{t("status.pending")}</SelectItem>
            <SelectItem value="approved">{t("status.approved")}</SelectItem>
            <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
            <SelectItem value="expired">{t("status.expiringSoon")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button>
          <Link href="/admin/documents/upload">
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.upload")}
          </Link>
        </Button>
      </div>
    </div>
  );
}