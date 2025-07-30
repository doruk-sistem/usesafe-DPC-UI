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
import { usePendingProducts } from "@/lib/hooks/use-pending-products";
import { Document } from "@/lib/types/document";
import { BaseProduct } from "@/lib/types/product";

// Mock data for available material manufacturers
const mockMaterialManufacturers = [
  {
    id: "mfr1",
    name: "Furkan Co",
    location: "İstanbul, Türkiye",
    specialization: "Pamuk İşleme",
    rating: 4.8,
    verified: true
  },
  {
    id: "mfr2", 
    name: "Alican Co",
    location: "Bursa, Türkiye",
    specialization: "Sentetik Elyaf",
    rating: 4.6,
    verified: true
  },
  {
    id: "mfr3",
    name: "Metin Tekstil",
    location: "Denizli, Türkiye", 
    specialization: "Doğal Elyaf",
    rating: 4.7,
    verified: false
  },
  {
    id: "mfr4",
    name: "Özkan Iplik",
    location: "Kahramanmaraş, Türkiye",
    specialization: "Pamuk, Akrilik",
    rating: 4.5,
    verified: true
  }
];

// Mock data for demonstration - gerçek uygulamada API'den gelecek
const mockManufacturedProducts = [
  {
    id: "1",
    name: "Bisiklet Yaka Pamuklu Regular Fit Scuba Kumaş Kısa Kollu Basic Erkek Tişört",
    model: "5SAM10058MK052",
    brandOwner: "Koton Co",
    manufacturerType: "contract", // fason
    status: "ACTIVE",
    materials: [
      {
        id: "mat1",
        name: "Pamuk",
        percentage: 55,
        recyclable: true,
        assignedManufacturer: null
      },
      {
        id: "mat2", 
        name: "Polyester",
        percentage: 45,
        recyclable: false,
        assignedManufacturer: {
          id: "comp1",
          name: "Furkan Co",
          type: "MATERIAL_MANUFACTURER"
        }
      }
    ]
  },
  {
    id: "2",
    name: "Akrilik Antibakteriyel Elyaf Karışımı Kazak",
    model: "KAZ2024001",
    brandOwner: "Mavi Co",
    manufacturerType: "contract",
    status: "ACTIVE", 
    materials: [
      {
        id: "mat3",
        name: "Akrilik",
        percentage: 60,
        recyclable: false,
        assignedManufacturer: null
      },
      {
        id: "mat4",
        name: "Antibakteriyel Elyaf", 
        percentage: 40,
        recyclable: false,
        assignedManufacturer: null
      }
    ]
  }
];

export default function ManufacturedProductsPage() {
  const t = useTranslations();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [showMaterialAssignmentDialog, setShowMaterialAssignmentDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);

  const { data, isLoading, error } = usePendingProducts(pageIndex, pageSize);

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

  const handleSaveAssignment = () => {
    if (!selectedManufacturer) return;
    
    // Bu kısımda gerçek API çağrısı yapılacak
    console.log("Assigning manufacturer:", {
      productId: selectedProduct.id,
      materialId: selectedMaterial.id,
      manufacturerId: selectedManufacturer.id
    });
    
    // Mock: Update the local data
    const updatedProducts = mockManufacturedProducts.map(product => {
      if (product.id === selectedProduct.id) {
        return {
          ...product,
          materials: product.materials.map(material => {
            if (material.id === selectedMaterial.id) {
              return {
                ...material,
                assignedManufacturer: selectedManufacturer
              };
            }
            return material;
          })
        };
      }
      return product;
    });
    
    // Close dialog and reset state
    setShowMaterialAssignmentDialog(false);
    setSelectedMaterial(null);
    setSelectedProduct(null);
    setSelectedManufacturer(null);
    setSearchQuery("");
  };

  const handleRemoveAssignment = () => {
    // Bu kısımda gerçek API çağrısı yapılacak
    console.log("Removing manufacturer assignment:", {
      productId: selectedProduct.id,
      materialId: selectedMaterial.id
    });
    
    // Close dialog and reset state
    setShowMaterialAssignmentDialog(false);
    setSelectedMaterial(null);
    setSelectedProduct(null);
    setSelectedManufacturer(null);
    setSearchQuery("");
  };

  const filteredManufacturers = mockMaterialManufacturers.filter(manufacturer =>
    manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manufacturer.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getManufacturerTypeDisplay = (type: string) => {
    return type === "contract" ? "Fason Üretim" : "Kendi Üretim";
  };

  const getManufacturerTypeBadge = (type: string) => {
    return type === "contract" ? "secondary" : "default";
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5" />
              Ürettiklerim
            </CardTitle>
            <CardDescription>
              Üretimini yaptığınız ürünler ve materyal tedarikçileri
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Products List */}
      <div className="space-y-4">
        {mockManufacturedProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge variant={getManufacturerTypeBadge(product.manufacturerType)}>
                      {getManufacturerTypeDisplay(product.manufacturerType)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Model: {product.model}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      Marka Sahibi: {product.brandOwner}
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
                    <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleViewDocuments(product.id)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Belgeleri Görüntüle
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = `/dashboard/products/${product.id}`;
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ürünü Görüntüle
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Materyal Tedarikçileri
                </h4>
                
                <div className="grid gap-3">
                  {product.materials.map((material) => (
                    <div key={material.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h5 className="font-medium">{material.name}</h5>
                            <Badge variant="outline">{material.percentage}%</Badge>
                            <Badge variant={material.recyclable ? "success" : "secondary"}>
                              {material.recyclable ? "Geri Dönüştürülebilir" : "Geri Dönüştürülemez"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Factory className="w-4 h-4 text-muted-foreground" />
                            {material.assignedManufacturer ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-green-700">
                                  {material.assignedManufacturer.name}
                                </span>
                                <Badge variant="success" className="text-xs">
                                  Atanmış
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Üretici atanmamış
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant={material.assignedManufacturer ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleAssignMaterialManufacturer(product, material)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          {material.assignedManufacturer ? "Değiştir" : "Üretici Ata"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documents Dialog */}
      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Ürün Belgeleri</DialogTitle>
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
              Materyal Üreticisi Ata
            </DialogTitle>
          </DialogHeader>
          
          {selectedMaterial && selectedProduct && (
            <div className="space-y-6">
              {/* Material Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Materyal:</h4>
                    <span>{selectedMaterial.name}</span>
                    <Badge variant="outline">{selectedMaterial.percentage}%</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Ürün:</h4>
                    <span className="text-sm">{selectedProduct.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Marka Sahibi:</h4>
                    <span className="text-sm">{selectedProduct.brandOwner}</span>
                  </div>
                </div>
              </div>

              {/* Current Assignment */}
              {selectedMaterial.assignedManufacturer && (
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800">Mevcut Üretici</h4>
                      <p className="text-green-700">{selectedMaterial.assignedManufacturer.name}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAssignment}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Kaldır
                    </Button>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="manufacturer-search">Üretici Ara</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="manufacturer-search"
                    placeholder="Üretici adı veya uzmanlık alanı ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Manufacturers List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <Label>Mevcut Üreticiler</Label>
                <div className="space-y-2">
                  {filteredManufacturers.map((manufacturer) => (
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
                            {manufacturer.verified && (
                              <Badge variant="success" className="text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                Doğrulanmış
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {manufacturer.specialization}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            📍 {manufacturer.location} • ⭐ {manufacturer.rating}
                          </p>
                        </div>
                        {selectedManufacturer?.id === manufacturer.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredManufacturers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Arama kriterlerinize uygun üretici bulunamadı.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMaterialAssignmentDialog(false)}
            >
              İptal
            </Button>
            <Button
              onClick={handleSaveAssignment}
              disabled={!selectedManufacturer}
            >
              <Check className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
