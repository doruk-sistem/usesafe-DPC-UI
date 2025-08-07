"use client";

import { useState } from "react";
import { Package, Search, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useProducts } from "@/lib/hooks/use-products";
import { useAssignDistributorToProduct } from "@/lib/hooks/use-distributors";
import { DistributorAssignment } from "@/lib/types/distributor";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributorId: string;
  distributorName: string;
  existingProductIds: string[];
}

export function AddProductModal({
  isOpen,
  onClose,
  distributorId,
  distributorName,
  existingProductIds
}: AddProductModalProps) {
  const t = useTranslations("distributors");
  const { toast } = useToast();
  const { products, isLoading } = useProducts();
  const assignDistributorMutation = useAssignDistributorToProduct();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Filter out products that are already assigned to this distributor
  const availableProducts = products.filter(product => 
    !existingProductIds.includes(product.id) &&
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignProduct = async () => {
    if (!selectedProduct) return;

    const assignment: DistributorAssignment = {
      distributorId,
      territory: undefined,
      commissionRate: undefined,
      notes: undefined,
    };

    try {
      await assignDistributorMutation.mutateAsync({
        productId: selectedProduct.id,
        assignment,
        assignedBy: ""
      });

      toast({
        title: t("products.add.success.title"),
        description: t("products.add.success.description", { 
          productName: selectedProduct.name,
          distributorName 
        }),
      });

      // Reset form and close modal
      setSelectedProduct(null);
      setSearchTerm("");
      onClose();
    } catch (error) {
      console.error("Error assigning product to distributor:", error);
      toast({
        title: t("products.add.error.title"),
        description: t("products.add.error.description"),
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t("products.add.title")}
          </DialogTitle>
          <DialogDescription>
            {t("products.add.description", { distributorName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Search */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-search">{t("products.add.search.label")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="product-search"
                  placeholder={t("products.add.search.placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="max-h-60 overflow-y-auto border rounded-md">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t("products.add.loading")}
                </div>
              ) : availableProducts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm ? t("products.add.noResults") : t("products.add.noProducts")}
                </div>
              ) : (
                <div className="divide-y">
                  {availableProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedProduct?.id === product.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          {product.model && (
                            <p className="text-sm text-muted-foreground">{product.model}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {product.product_type}
                          </p>
                        </div>
                        {selectedProduct?.id === product.id && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("products.add.cancel")}
          </Button>
          <Button
            onClick={handleAssignProduct}
            disabled={!selectedProduct || assignDistributorMutation.isPending}
          >
            {assignDistributorMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t("products.add.assigning")}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {t("products.add.assign")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
