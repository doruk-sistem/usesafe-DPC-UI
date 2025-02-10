"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Company } from '@/lib/types/company';

interface ManufacturerSearchResultsProps {
  manufacturers: Company[];
  value: string | null;
  onSelect: (manufacturer: Company) => void;
}

export function ManufacturerSearchResults({ manufacturers, value, onSelect }: ManufacturerSearchResultsProps) {
  return (
    <Card>
      <ScrollArea className="h-[200px]">
        <CardContent className="p-4 space-y-2">
          {manufacturers.map((manufacturer) => (
            <Button
              key={manufacturer.id}
              type="button"
              variant={value === manufacturer.id ? 'secondary' : 'ghost'}
              className="w-full justify-start text-left"
              onClick={() => onSelect(manufacturer)}
            >
              <div>
                <div className="font-medium">{manufacturer.name}</div>
                <div className="text-sm text-muted-foreground">
                  Tax ID: {manufacturer.taxInfo.taxNumber}
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
} 