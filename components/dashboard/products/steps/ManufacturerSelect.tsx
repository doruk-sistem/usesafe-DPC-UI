"use client";

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useEffect } from 'react';
import { CompanyService } from '@/lib/services/company';
import type { Company } from '@/lib/types/company';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManufacturerSelectProps {
  form: any;
  companyType: string | null;
}

export function ManufacturerSelect({ form, companyType }: ManufacturerSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [manufacturers, setManufacturers] = useState<Company[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Company | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setManufacturers([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await CompanyService.searchManufacturers(query);
      setManufacturers(results);
    } catch (error) {
      console.error('Error searching manufacturers:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Update search results when debounced query changes
  useEffect(() => {
    handleSearch(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Select Manufacturer</h3>
            <p className="text-sm text-muted-foreground">
              {companyType === 'brand_owner' 
                ? 'Search and select the manufacturer for this product'
                : 'You are registered as a manufacturer. This step is for brand owners only.'}
            </p>
          </div>

          {companyType === 'brand_owner' ? (
            <FormField
              control={form.control}
              name="manufacturer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer *</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search manufacturers by name or tax ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {isSearching ? (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-center">
                              <span className="text-sm text-muted-foreground">Searching...</span>
                            </div>
                          </CardContent>
                        </Card>
                      ) : manufacturers.length > 0 ? (
                        <Card>
                          <ScrollArea className="h-[200px]">
                            <CardContent className="p-4 space-y-2">
                              {manufacturers.map((manufacturer) => (
                                <Button
                                  key={manufacturer.id}
                                  type="button"
                                  variant={field.value === manufacturer.id ? "secondary" : "ghost"}
                                  className="w-full justify-start text-left"
                                  onClick={() => {
                                    // Update form field and local state
                                    field.onChange(manufacturer.id);
                                    setSelectedManufacturer(manufacturer);
                                    setSearchQuery('');
                                    setManufacturers([]);
                                  }}
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
                      ) : searchQuery && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-sm text-muted-foreground">No manufacturers found</span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {/* Show selected manufacturer */}
                      {selectedManufacturer && !searchQuery && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{selectedManufacturer.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Tax ID: {selectedManufacturer.taxInfo.taxNumber}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  field.onChange(null);
                                  setSelectedManufacturer(null);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-muted-foreground">
                As a manufacturer, you can proceed to the next step. Your company will automatically be set as the manufacturer.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}