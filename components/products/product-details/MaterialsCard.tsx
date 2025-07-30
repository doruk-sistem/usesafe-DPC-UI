"use client";

import { motion } from "framer-motion";
import { Factory, Building2, Users, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductMaterialsWithManufacturers } from "@/lib/hooks/use-material-manufacturers";

interface MaterialsCardProps {
  productId: string;
  title?: string;
}

// Mock data for company info - gerçek uygulamada bu veriler API'den gelecek
const mockProductData = {
  productOwner: "Koton Co",
  contractManufacturer: "Bartu Co",
  manufacturerType: "contract", // contract = fason, own = kendi
};

export function MaterialsCard({ productId, title = "Malzemeler" }: MaterialsCardProps) {
  const t = useTranslations("productDetails.materials");
  
  const { data: materials, isLoading, error } = useProductMaterialsWithManufacturers(productId);

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("loading") || "Loading materials..."}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            Error loading materials: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("noMaterials") || "No materials found for this product."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Üretim Zinciri Görünümü */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Üretim Zinciri
            </h3>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Ürün Sahibi</p>
                  <p className="text-sm text-muted-foreground">{mockProductData.productOwner}</p>
                </div>
              </div>
              
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Factory className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {mockProductData.manufacturerType === "contract" ? "Fason Üretici" : "Kendi Üretici"}
                  </p>
                  <p className="text-sm text-muted-foreground">{mockProductData.contractManufacturer}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Materyal Listesi */}
          <div className="space-y-4">
            {materials.map((material) => (
              <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{material.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{material.percentage}%</Badge>
                      <Badge variant={material.recyclable ? "success" : "secondary"}>
                        {material.recyclable ? "Geri Dönüştürülebilir" : "Geri Dönüştürülemez"}
                      </Badge>
                    </div>
                    {material.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {material.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Materyal Üreticileri */}
                <div className="mt-4 pt-4 border-t">
                  <h5 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    Materyal Üreticileri
                  </h5>
                  
                  {material.manufacturer ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-green-100 rounded">
                            <Building2 className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{material.manufacturer.name}</span>
                              <Badge variant="success" className="text-xs">
                                Atanmış
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Materyal Üreticisi</p>
                            {material.assigned_by && (
                              <p className="text-xs text-blue-600">
                                {material.assigned_by.name} tarafından atandı
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Tedarikçi
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground text-center">
                        Bu materyal için henüz üretici atanmamış
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
} 