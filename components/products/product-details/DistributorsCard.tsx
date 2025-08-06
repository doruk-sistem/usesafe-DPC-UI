"use client";

import { motion } from "framer-motion";
import { Truck, Mail, Phone, Globe, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Error } from "@/components/ui/error";
import { useProductDistributors } from "@/lib/hooks/use-distributors";

interface DistributorsCardProps {
  productId: string;
  title?: string;
}

export function DistributorsCard({ productId, title = "Distribütörler" }: DistributorsCardProps) {
  const t = useTranslations("products.details.distributors");
  
  const { productDistributors, isLoading, error } = useProductDistributors(productId);

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("loading") || "Loading distributors..."}
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
            <Truck className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Error
            title={t("errorLoadingDistributors")}
            error={error}
            className="min-h-[200px]"
          />
        </CardContent>
      </Card>
    );
  }

  if (!productDistributors || productDistributors.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("noDistributors") || "No distributors found for this product."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-4">
            {productDistributors.map((productDistributor) => {
              const distributor = productDistributor.distributor;
              if (!distributor) return null;

              return (
                <div key={productDistributor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{distributor.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{distributor.companyType}</Badge>
                        <Badge variant={productDistributor.status === 'active' ? "success" : "secondary"}>
                          {productDistributor.status === 'active' ? t("status.active") : t("status.inactive")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Distribütör İletişim Bilgileri */}
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      {t("contactInformation")}
                    </h5>
                    
                    <div className="space-y-2">
                      {/* Vergi Numarası */}
                      {distributor.taxInfo?.taxNumber && (
                        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                          <div className="p-1.5 bg-blue-100 rounded">
                            <Truck className="w-3 h-3 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Vergi Numarası</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {distributor.taxInfo.taxNumber}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* E-posta */}
                      {distributor.email && (
                        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                          <div className="p-1.5 bg-green-100 rounded">
                            <Mail className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">E-posta</p>
                            <p className="text-xs text-muted-foreground">
                              {distributor.email}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Telefon */}
                      {distributor.phone && (
                        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                          <div className="p-1.5 bg-orange-100 rounded">
                            <Phone className="w-3 h-3 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Telefon</p>
                            <p className="text-xs text-muted-foreground">
                              {distributor.phone}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Web Sitesi */}
                      {distributor.website && (
                        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                          <div className="p-1.5 bg-purple-100 rounded">
                            <Globe className="w-3 h-3 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Web Sitesi</p>
                            <a 
                              href={distributor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {distributor.website}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Adres */}
                      {distributor.address && (
                        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                          <div className="p-1.5 bg-gray-100 rounded">
                            <Truck className="w-3 h-3 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Adres</p>
                            <p className="text-xs text-muted-foreground">
                              {distributor.address.headquarters || JSON.stringify(distributor.address)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Atama Tarihi */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs text-muted-foreground">
                        <span>
                          {t("assignedAt")}: {productDistributor.assignedAt ? new Date(productDistributor.assignedAt).toLocaleDateString('tr-TR') : t("unknown")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
} 