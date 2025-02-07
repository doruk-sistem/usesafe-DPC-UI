"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import type { Company } from '@/lib/types/company';

interface SelectedManufacturerCardProps {
  manufacturer: Company;
  onClear: () => void;
}

export function SelectedManufacturerCard({ manufacturer, onClear }: SelectedManufacturerCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">{manufacturer.name}</div>
            <div className="text-sm text-muted-foreground">
              Tax ID: {manufacturer.taxInfo.taxNumber}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 