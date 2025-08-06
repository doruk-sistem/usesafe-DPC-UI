"use client";

import { Check, Plus, Search, Truck, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { mockDistributors } from "@/lib/data/mock-distributors";
import type { Distributor } from "@/lib/types/distributor";

interface DistributorSelectProps {
  form: UseFormReturn<any>;
}

export function DistributorSelect({ form }: DistributorSelectProps) {
  const t = useTranslations("productManagement.form.distributor");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistributors, setSelectedDistributors] = useState<Distributor[]>([]);

  // Arama fonksiyonu
  const filteredDistributors = mockDistributors.filter(distributor =>
    distributor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    distributor.taxInfo.taxNumber.includes(searchQuery)
  );

  // Distribütör ekleme
  const handleAddDistributor = (distributor: Distributor) => {
    if (!selectedDistributors.find(d => d.id === distributor.id)) {
      const updatedSelection = [...selectedDistributors, distributor];
      setSelectedDistributors(updatedSelection);
      form.setValue("distributors", updatedSelection);
    }
  };

  // Distribütör çıkarma
  const handleRemoveDistributor = (distributorId: string) => {
    const updatedSelection = selectedDistributors.filter(d => d.id !== distributorId);
    setSelectedDistributors(updatedSelection);
    form.setValue("distributors", updatedSelection);
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Seçili Distribütörler */}
      {selectedDistributors.length > 0 && (
        <Card className="p-4">
          <FormField
            control={form.control}
            name="distributors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("selectedDistributors")}</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {selectedDistributors.map((distributor) => (
                      <div
                        key={distributor.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{distributor.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {distributor.taxInfo.taxNumber}
                            </p>
                            {distributor.email && (
                              <p className="text-sm text-muted-foreground">
                                {distributor.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {distributor.assignedProducts || 0} {t("products")}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDistributor(distributor.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>
      )}

      {/* Distribütör Arama ve Seçim */}
      <Card className="p-4">
        <FormField
          control={form.control}
          name="distributorSearch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("searchDistributors")}</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Arama Kutusu */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Distribütör Listesi */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredDistributors.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>{t("noDistributorsFound")}</p>
                      </div>
                    ) : (
                      filteredDistributors.map((distributor) => {
                        const isSelected = selectedDistributors.some(d => d.id === distributor.id);
                        
                        return (
                          <div
                            key={distributor.id}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                              isSelected 
                                ? "border-primary bg-primary/5" 
                                : "hover:border-muted-foreground/30"
                            }`}
                            onClick={() => !isSelected && handleAddDistributor(distributor)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                                {isSelected ? (
                                  <Check className="h-4 w-4 text-primary" />
                                ) : (
                                  <Plus className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{distributor.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {distributor.taxInfo.taxNumber}
                                </p>
                                {distributor.email && (
                                  <p className="text-sm text-muted-foreground">
                                    {distributor.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {distributor.assignedProducts || 0} {t("products")}
                              </Badge>
                              {isSelected && (
                                <Badge variant="secondary">
                                  {t("selected")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Card>

      {/* Bilgi Kartı */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
            <Truck className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900">{t("info.title")}</h4>
            <p className="text-sm text-blue-700 mt-1">{t("info.description")}</p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• {t("info.benefit1")}</li>
              <li>• {t("info.benefit2")}</li>
              <li>• {t("info.benefit3")}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
} 