"use client";

import {
  Plus,
  MoreHorizontal,
  FileText,
  Eye,
  Factory,
  Users,
  Building2,
  ArrowRight,
  Settings,
  Search,
  Check,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ProductDocuments } from "@/components/dashboard/products/product-documents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAssignMaterialManufacturer,
  useRemoveMaterialManufacturer,
  useAvailableManufacturers,
} from "@/lib/hooks/use-material-manufacturers";
import { useManufacturedProducts } from "@/lib/hooks/use-manufactured-products";
import { usePendingProducts } from "@/lib/hooks/use-pending-products";
import { Document } from "@/lib/types/document";
import { BaseProduct } from "@/lib/types/product";
import { useAuth } from "@/lib/hooks/use-auth";

export default function ManufacturedProductsPage() {
  const t = useTranslations("dashboard.manufacturedProducts");
  const { company } = useAuth();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [showMaterialAssignmentDialog, setShowMaterialAssignmentDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);

  const { data: manufacturedProducts = [], isLoading: productsLoading, error: productsError } = useManufacturedProducts(company?.id);
  const { data: availableManufacturers = [], isLoading: manufacturersLoading } = useAvailableManufacturers();
  const assignMaterialManufacturer = useAssignMaterialManufacturer();
  const removeMaterialManufacturer = useRemoveMaterialManufacturer();

  const handleViewDocuments = (productId: string) => {
    setSelectedProductId(productId);
    setShowDocumentsDialog(true);
  };

  const handleAssignMaterialManufacturer = (product: any, material: any) => {
    setSelectedProductId(product.id);
    setSelectedProduct(product);
    setSelectedMaterial(material);
    setSelectedManufacturer(material.assignedManufacturer);
    setSearchQuery("");
    setShowMaterialAssignmentDialog(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedManufacturer || !selectedMaterial || !selectedProduct || !company?.id) return;
    
    try {
      await assignMaterialManufacturer.mutateAsync({
        materialId: selectedMaterial.id,
        manufacturerId: selectedManufacturer.id,
        assignedBy: company.id,
        productId: selectedProduct.id,
      });
      
      // Close dialog and reset state
      setShowMaterialAssignmentDialog(false);
      setSelectedMaterial(null);
      setSelectedProduct(null);
      setSelectedManufacturer(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Error assigning manufacturer:", error);
    }
  };

  const handleRemoveAssignment = async () => {
    if (!selectedMaterial || !selectedProduct) return;
    
    try {
      await removeMaterialManufacturer.mutateAsync({
        materialId: selectedMaterial.id,
        productId: selectedProduct.id,
      });
      
      // Close dialog and reset state
      setShowMaterialAssignmentDialog(false);
      setSelectedMaterial(null);
      setSelectedProduct(null);
      setSelectedManufacturer(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Error removing manufacturer:", error);
    }
  };

  const filteredManufacturers = availableManufacturers.filter(manufacturer =>
    manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (manufacturer.companyType && manufacturer.companyType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getManufacturerTypeDisplay = (type: string) => {
    return type === "contract" ? "Fason Üretim" : "Kendi Üretim";
  };

  const getManufacturerTypeBadge = (type: string) => {
    return type === "contract" ? "secondary" : "default";
  };

  if (productsLoading) {
    return <Loading />;
  }

  if (productsError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-red-500">
              {t("errorLoadingProducts")}: {productsError.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5" />
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("description")}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Products List */}
      <div className="space-y-4">
        {productsLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                {t("loading")}
              </div>
            </CardContent>
          </Card>
        ) : manufacturedProducts.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <Factory className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">{t("noProductsAssigned")}</h3>
                  <p className="text-muted-foreground">
                    {t("noProductsAssignedDescription")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("noProductsAssignedDescription2")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          manufacturedProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge variant="secondary">
                        {t("contractManufacturer")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{t("model")}: {product.model}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {t("brandOwner")}: {product.brand_owner?.name || t("unknownManufacturer")}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleViewDocuments(product.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {t("viewDocuments")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          window.location.href = `/dashboard/products/${product.id}`;
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t("viewProduct")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t("materialSuppliers")}
                  </h4>
                  
                  <div className="grid gap-3">
                    {product.materials && product.materials.length > 0 ? (
                      product.materials.map((material) => (
                        <div key={material.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h5 className="font-medium">{material.name}</h5>
                                <Badge variant="outline">{material.percentage}%</Badge>
                                <Badge variant={material.recyclable ? "success" : "secondary"}>
                                  {material.recyclable ? t("recyclable.yes") : t("recyclable.no")}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Factory className="w-4 h-4 text-muted-foreground" />
                                {material.assignedManufacturer ? (
                                  <span className="text-sm">
                                    {t("materialManufacturer")}: <span className="font-medium">{material.assignedManufacturer.name}</span>
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    {t("materialManufacturerAssign")}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAssignMaterialManufacturer(product, material)}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              {material.assignedManufacturer ? t("changeManufacturer") : t("assignManufacturer")}
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        {t("noMaterialsAssigned")}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Documents Dialog */}
      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("documentsTitle")}</DialogTitle>
          </DialogHeader>
          {selectedProductId && (
            <div className="space-y-4">
              <ProductDocuments productId={selectedProductId} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Material Assignment Dialog - Bu kısım sonraki adımda tasarlanacak */}
      <Dialog open={showMaterialAssignmentDialog} onOpenChange={setShowMaterialAssignmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t("materialAssignmentTitle")}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMaterial && selectedProduct && (
            <div className="space-y-6">
              {/* Material Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{t("material")}:</h4>
                    <span>{selectedMaterial.name}</span>
                    <Badge variant="outline">{selectedMaterial.percentage}%</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{t("product")}:</h4>
                    <span className="text-sm">{selectedProduct.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{t("brandOwner")}:</h4>
                    <span className="text-sm">{selectedProduct.brand_owner?.name || t("unknownManufacturer")}</span>
                  </div>
                </div>
              </div>

              {/* Current Assignment */}
              {selectedMaterial.assignedManufacturer && (
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800">{t("currentManufacturer")}</h4>
                      <p className="text-green-700">{selectedMaterial.assignedManufacturer.name}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAssignment}
                      className="text-red-600 hover:text-red-700"
                      disabled={removeMaterialManufacturer.isPending}
                    >
                      {removeMaterialManufacturer.isPending ? (
                        <Loading className="w-4 h-4 mr-2" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      {t("removeManufacturer")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="manufacturer-search">{t("searchManufacturer")}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="manufacturer-search"
                    placeholder={t("searchManufacturerPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Manufacturers List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <Label>{t("currentManufacturers")}</Label>
                <div className="space-y-2">
                  {manufacturersLoading ? (
                    <div className="text-center py-8">
                      <Loading />
                    </div>
                  ) : filteredManufacturers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>{t("noManufacturersFound")}</p>
                    </div>
                  ) : (
                    filteredManufacturers.map((manufacturer) => (
                      <div
                        key={manufacturer.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedManufacturer?.id === manufacturer.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedManufacturer(manufacturer)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{manufacturer.name}</h5>
                              <Badge variant="outline" className="text-xs">
                                {manufacturer.companyType || t("manufacturer")}
                              </Badge>
                            </div>
                            {selectedManufacturer?.id === manufacturer.id && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMaterialAssignmentDialog(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSaveAssignment}
              disabled={!selectedManufacturer || assignMaterialManufacturer.isPending}
            >
              {assignMaterialManufacturer.isPending ? (
                <Loading className="w-4 h-4 mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
