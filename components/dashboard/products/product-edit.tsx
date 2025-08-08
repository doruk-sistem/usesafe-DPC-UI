"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, AlertCircle, Upload, FileText, Download, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { STANDARD_TO_AI_MAPPING, DOCUMENT_TYPE_CONFIG } from "@/lib/constants/documents";
import { getDocuments, uploadDocument } from "@/lib/services/documents";
import { productService } from "@/lib/services/product";
import { useAllProductTypes } from "@/lib/services/product-types";
import { Document } from "@/lib/types/document";
import { BaseProduct } from "@/lib/types/product";
import { useProductMaterialsWithManufacturers } from "@/lib/hooks/use-material-manufacturers";
import { MaterialManufacturerService } from "@/lib/services/material-manufacturer";
import { SustainabilityCalculatorService } from "@/lib/services/sustainability-calculator";
import { useMaterials } from "@/lib/hooks/use-materials";

interface ProductEditProps {
  productId: string;
  reuploadDocumentId?: string;
}

interface Material {
  id: string;
  name: string;
  percentage: number;
  recyclable: boolean;
  description?: string;
  sustainability_score?: number;
  carbon_footprint?: string;
  water_usage?: string;
  energy_consumption?: string;
  chemical_usage?: string;
  co2_emissions?: string;
  recycled_content_percentage?: number;
  biodegradability_percentage?: number;
  minimum_durability_years?: number;
  water_consumption_per_unit?: string;
  greenhouse_gas_emissions?: string;
  chemical_consumption_per_unit?: string;
  recycled_materials_percentage?: number;
}

const documentTypeLabels = (t: any): Record<string, string> => ({
  quality_cert: t("qualityCertificate"),
  safety_cert: t("safetyCertificate"),
  test_reports: t("testReports"),
  technical_docs: t("technicalDocumentation"),
  compliance_docs: t("complianceDocuments"),
  certificates: t("certificates"),
  other: t("other")
});

// Belge türünü gösterme fonksiyonu - AI türlerini destekler
const getDocumentTypeLabel = (doc: any, t: any) => {
  // Eğer originalType varsa (AI'dan gelen), onu göster
  if (doc.originalType) {
    return doc.originalType;
  }
  
  // Standart türler için label kullan
  return documentTypeLabels(t)[doc.type] || doc.type;
};

export function ProductEdit({ productId, reuploadDocumentId }: ProductEditProps) {
  const [product, setProduct] = useState<BaseProduct | null>(null);
  const [rejectedDocument, setRejectedDocument] = useState<Document | null>(null);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const t = useTranslations("productManagement.edit");
  const [newDocument, setNewDocument] = useState<{
    file: File | null;
    name: string;
    type: string;
  }>({
    file: null,
    name: "",
    type: "technical_docs",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; name: string; type: string } | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { data: allProductTypes } = useAllProductTypes();
  const { 
    materials, 
    isLoading: materialsLoading, 
    error: materialsError,
    totalPercentage,
    isPercentageValid,
    getPercentageStatus,
    addMaterial,
    removeMaterial,
    updateMaterialsSustainability
  } = useMaterials(productId);
  const [newMaterial, setNewMaterial] = useState<Omit<Material, 'id'>>({
    name: "",
    percentage: 0,
    recyclable: false,
    description: ""
  });
  const [showAddMaterialDialog, setShowAddMaterialDialog] = useState(false);

  // Helper to get product type name by id
  const getProductTypeName = (typeId: number | string | undefined) => {
    if (!typeId || !allProductTypes) return "Unknown";
    
    // First try to find by id (if typeId is numeric)
    const numericId = typeof typeId === 'string' ? parseInt(typeId, 10) : typeId;
    if (!isNaN(numericId)) {
      const foundById = allProductTypes.find(pt => pt.id === numericId);
      if (foundById) return foundById.product;
    }
    
    // If not found by id, try to find by product name/value
    const foundByName = allProductTypes.find(
      pt => pt.product.toLowerCase() === String(typeId).toLowerCase()
    );
    if (foundByName) return foundByName.product;
    
    // If still not found, return the original value or "Unknown"
    return String(typeId) || "Unknown";
  };

  // Helper to get full product type display (category + subcategory)
  const getFullProductTypeDisplay = () => {
    const subcategory = product?.product_subcategory;
    
    if (subcategory) {
      return subcategory;
    }
    
    // Fallback to category if no subcategory
    const category = getProductTypeName(product?.product_type);
    return category || "Unknown";
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    product_type: "",
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        // Yeni sistem: getDocuments servisini kullan
        const { documents, product: fetchedProduct } = await getDocuments(productId);
        
        setProduct(fetchedProduct);
        setAllDocuments(documents);
        
        // Initialize form data
        setFormData({
          name: fetchedProduct.name ?? "",
          model: fetchedProduct.model ?? "",
          product_type: fetchedProduct.product_type ?? "",
        });

        // Materials are now handled by the useMaterials hook
        
        // If we have a reuploadDocumentId, find the rejected document
        if (reuploadDocumentId) {
          const doc = documents.find((doc: Document) => doc.id === reuploadDocumentId);
          if (doc) {
            setRejectedDocument(doc);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: t("error"),
          description: t("failedToLoadProduct"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId, reuploadDocumentId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleNewDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocument(prev => ({
        ...prev,
        file,
        name: file.name,
      }));
    }
  };

  const handleDocumentTypeChange = (value: string) => {
    setNewDocument(prev => ({
      ...prev,
      type: value,
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentId?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Yeni sistem: uploadDocument servisini kullan
      await uploadDocument(productId, file, newDocument.type, {
        version: "1.0",
        notes: "Re-uploaded document"
      });
      
      // Refresh documents
      const { documents } = await getDocuments(productId);
      setAllDocuments(documents);
      
      toast({
        title: t("success"),
        description: t("documentUploadedSuccess"),
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: t("error"),
        description: t("failedToUploadDocument"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, documentName?: string, documentType?: string) => {
    setDocumentToDelete({ id: documentId, name: documentName || 'this document', type: documentType || '' });
    setShowDeleteDialog(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setIsDeleting(documentToDelete.id);
      
      // Delete from documents table
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentToDelete.id);

      if (error) throw error;

      // Update local state
      setAllDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));

      toast({
        title: t("success"),
        description: t("documentDeletedSuccess"),
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: t("error"),
        description: t("failedToDeleteDocument"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    }
  };

  const handleAddNewDocument = async () => {
    if (!newDocument.file) return;

    try {
      setIsUploading(true);
      
      // Yeni sistem: uploadDocument servisini kullan
      await uploadDocument(productId, newDocument.file, newDocument.type, {
        version: "1.0",
        notes: "Added via edit page"
      });
      
      // Refresh documents
      const { documents } = await getDocuments(productId);
      setAllDocuments(documents);
      
      // Reset form
      setNewDocument({
        file: null,
        name: "",
        type: "technical_docs",
      });
      setShowAddDialog(false);

      toast({
        title: t("success"),
        description: t("documentAddedSuccess"),
      });
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        title: t("error"),
        description: t("failedToAddDocument"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: string | number | boolean = value;
    
    if (type === "number") {
      fieldValue = parseFloat(value) || 0;
    }
    
    setNewMaterial(prev => ({
      ...prev,
      [name]: fieldValue
    }));
  };

  const handleRecyclableChange = (value: string) => {
    setNewMaterial(prev => ({
      ...prev,
      recyclable: value === "true"
    }));
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || newMaterial.percentage <= 0) {
      toast({
        title: t("error"),
        description: "Malzeme adı ve yüzde gerekli",
        variant: "destructive",
      });
      return;
    }

    // Toplam yüzde kontrolü
    if (totalPercentage + newMaterial.percentage > 100) {
      toast({
        title: t("error"),
        description: "Toplam yüzde 100'ü geçemez",
        variant: "destructive",
      });
      return;
    }

    try {
      await addMaterial({
        product_id: productId,
        name: newMaterial.name,
        percentage: newMaterial.percentage,
        recyclable: newMaterial.recyclable,
        description: newMaterial.description || ""
      });

      setNewMaterial({
        name: "",
        percentage: 0,
        recyclable: false,
        description: ""
      });
      setShowAddMaterialDialog(false);

      toast({
        title: t("success"),
        description: "Material added successfully",
      });
    } catch (error) {
      console.error("Error adding material:", error);
      toast({
        title: t("error"),
        description: "Failed to add material",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMaterial = async (id: string) => {
    try {
      await removeMaterial(id);

      toast({
        title: t("success"),
        description: "Material removed successfully",
      });
    } catch (error) {
      console.error("Error removing material:", error);
      toast({
        title: t("error"),
        description: "Failed to remove material",
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!product) return;

    try {
      setIsSaving(true);
      
      // Update product basic info
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          model: formData.model,
          product_type: formData.product_type,
        })
        .eq("id", productId);

      if (error) throw error;

      // Calculate sustainability metrics if materials exist
      if (materials && materials.length > 0) {
        try {
          // Convert materials to the format expected by SustainabilityCalculatorService
          const sustainabilityMaterials = materials.map(mat => ({
            name: mat.name,
            percentage: mat.percentage,
            recyclable: mat.recyclable,
            description: mat.description || ""
          }));

          // Convert weight from kg to grams for the sustainability calculation
          const weightInGrams = product.weight ? product.weight * 1000 : 500;
          
          const sustainabilityMetrics = await SustainabilityCalculatorService.calculateFromProductType(
            product.product_type || "",
            product.product_subcategory || "",
            sustainabilityMaterials,
            weightInGrams
          );

          // Update materials with sustainability metrics using the hook
          await updateMaterialsSustainability({
            sustainability_score: sustainabilityMetrics.sustainability_score,
            carbon_footprint: sustainabilityMetrics.carbon_footprint,
            water_usage: sustainabilityMetrics.water_usage,
            energy_consumption: sustainabilityMetrics.energy_consumption,
            chemical_usage: sustainabilityMetrics.chemical_consumption_per_unit,
            co2_emissions: sustainabilityMetrics.co2e_emissions_per_unit,
            recycled_content_percentage: parseFloat(sustainabilityMetrics.recycled_content_percentage) || 0,
            biodegradability_percentage: parseFloat(sustainabilityMetrics.biodegradability) || 0,
            minimum_durability_years: parseInt(sustainabilityMetrics.minimum_durability_years) || 1,
            water_consumption_per_unit: sustainabilityMetrics.water_consumption_per_unit,
            greenhouse_gas_emissions: sustainabilityMetrics.greenhouse_gas_emissions,
            chemical_consumption_per_unit: sustainabilityMetrics.chemical_consumption_per_unit,
            recycled_materials_percentage: parseFloat(sustainabilityMetrics.recycled_materials_percentage) || 0
          });

          toast({
            title: t("success"),
            description: "Product updated and sustainability metrics calculated successfully",
          });
        } catch (sustainabilityError) {
          console.error("Error calculating sustainability metrics:", sustainabilityError);
          toast({
            title: t("success"),
            description: "Product updated but sustainability calculation failed",
          });
        }
      } else {
        toast({
          title: t("success"),
          description: t("productUpdatedSuccess"),
        });
      }

      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: t("error"),
        description: t("failedToUpdateProduct"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string | undefined | null) => {
    if (!status) return null;
    
    const statusConfig = {
      pending: { variant: "secondary" as const, text: t("pending") },
      approved: { variant: "default" as const, text: t("approved") },
      rejected: { variant: "destructive" as const, text: t("rejected") },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    );
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${productId}/images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Update product images
      const newImage = {
        url: publicUrl,
        alt: file.name,
        is_primary: !product?.images || product.images.length === 0
      };

      const updatedImages = [...(product?.images || []), newImage];
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: updatedImages })
        .eq('id', productId);

      if (updateError) throw updateError;

      setProduct(prev => prev ? { ...prev, images: updatedImages } : null);
      setNewImage(null);

      toast({
        title: t("success"),
        description: t("imageUploadedSuccess"),
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: t("error"),
        description: t("failedToUploadImage"),
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      const updatedImages = product?.images?.filter(img => img.url !== imageUrl) || [];
      
      const { error } = await supabase
        .from('products')
        .update({ images: updatedImages })
        .eq('id', productId);

      if (error) throw error;

      setProduct(prev => prev ? { ...prev, images: updatedImages } : null);

      toast({
        title: t("success"),
        description: t("imageDeletedSuccess"),
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: t("error"),
        description: t("failedToDeleteImage"),
        variant: "destructive",
      });
    }
  };

  const handleSetPrimaryImage = async (imageUrl: string) => {
    if (!product) return;

    try {
      const updatedImages = product.images?.map(img => ({
        ...img,
        is_primary: img.url === imageUrl
      })) || [];
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: updatedImages })
        .eq('id', productId);

      if (updateError) throw updateError;

      setProduct(prev => prev ? { ...prev, images: updatedImages } : null);
      toast({
        title: t("success"),
        description: t("primaryImageUpdatedSuccess"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failedToUpdatePrimaryImage"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("editProduct")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={`loading-${i}`} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold mb-2">{t("productNotFound")}</h2>
          <p className="text-muted-foreground mb-4">
            {t("productNotFoundDescription")}
          </p>
          <Button asChild>
            <Link href="/dashboard/products">{t("backToProducts")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/products">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">{t("back")}</span>
              </Link>
            </Button>
            <CardTitle>{t("editProduct")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
          {/* Ürün reddedilme sebebi */}
          {product?.status === "DELETED" && product?.status_history && product.status_history.length > 0 && (
            (() => {
              const lastHistory = product.status_history[product.status_history.length - 1];
              if (lastHistory.reason && lastHistory.reason.startsWith("Rejected:")) {
                return (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t("productRejected")}</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2">
                        <p><strong>{t("rejectionReason")}:</strong> {lastHistory.reason.replace("Rejected: ", "")}</p>
                        <p><strong>{t("rejectionDate")}:</strong> {new Date(lastHistory.timestamp).toLocaleDateString()}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                );
              }
              return null;
            })()
          )}

          {rejectedDocument && (
            <Alert variant="destructive" key="rejected-document-alert">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("documentRejected")}</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  <p key="doc-name"><strong>{t("document")}:</strong> {rejectedDocument.name}</p>
                  <p key="doc-type"><strong>{t("type")}:</strong> {getDocumentTypeLabel(rejectedDocument, t)}</p>
                  <p key="doc-reason"><strong>{t("rejectionReason")}:</strong> {rejectedDocument.rejection_reason}</p>
                  <p key="doc-date"><strong>{t("rejectionDate")}:</strong> {rejectedDocument.uploadedAt ? new Date(rejectedDocument.uploadedAt).toLocaleDateString() : t("notAvailable")}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">{t("productName")}</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">{t("model")}</Label>
            <Input 
              id="model" 
              value={formData.model} 
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{t("productType")}</Label>
            <Input 
              id="product_type" 
              value={getFullProductTypeDisplay()} 
              onChange={handleInputChange}
            />
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("productImages")}</h3>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewImage(file);
                      handleImageUpload(file);
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  size="sm"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    t("uploading")
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {t("addNewImage")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {product?.images?.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square relative rounded-lg overflow-hidden border">
                    <img
                      src={image.url}
                      alt={image.alt || `Product image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetPrimaryImage(image.url)}
                        disabled={image.is_primary}
                      >
                        {image.is_primary ? t("primary") : t("setAsPrimary")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
                     <Separator className="my-6" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("productDocuments")}</h3>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("addNewDocument")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("addNewDocument")}</DialogTitle>
                    <DialogDescription>
                      {t("addNewDocumentDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="document-file">{t("documentFile")}</Label>
                      <Input
                        id="document-file"
                        type="file"
                        onChange={handleNewDocumentChange}
                      />
                      {newDocument.file && (
                        <p className="text-sm text-muted-foreground">
                          {t("selected")}: {newDocument.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document-type">{t("documentType")}</Label>
                      <Select
                        value={newDocument.type}
                        onValueChange={handleDocumentTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectDocumentType")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical_docs">{t("technicalDocumentation")}</SelectItem>
                          <SelectItem value="test_reports">{t("testReports")}</SelectItem>
                          <SelectItem value="compliance_docs">{t("complianceDocuments")}</SelectItem>
                          <SelectItem value="certificates">{t("certificates")}</SelectItem>
                          <SelectItem value="other">{t("other")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleAddNewDocument} disabled={isUploading || !newDocument.file}>
                      {isUploading ? t("uploading") : t("uploadDocument")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {allDocuments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                {t("noDocumentsFound")}
              </div>
            ) : (
              <div className="space-y-4">
                {allDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{doc.name}</span>
                        {getStatusBadge(doc.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={doc.url || "#"}>
                            <Download className="h-4 w-4 mr-1" />
                            {t("download")}
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteDocument(doc.id, doc.name, doc.type)}
                          disabled={isDeleting === doc.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {isDeleting === doc.id ? t("deleting") : t("delete")}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div key={`doc-type-${doc.id}`}>
                        <span className="font-medium">{t("type")}:</span> {getDocumentTypeLabel(doc, t)}
                      </div>
                      <div key={`doc-version-${doc.id}`}>
                        <span className="font-medium">{t("version")}:</span> {doc.version || "1.0"}
                      </div>
                      <div key={`doc-upload-date-${doc.id}`}>
                        <span className="font-medium">{t("uploadDate")}:</span> {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : t("notAvailable")}
                      </div>
                      {doc.rejection_reason && (
                        <div key={`doc-rejection-reason-${doc.id}`}>
                          <span className="font-medium">{t("rejectionReason")}:</span> {doc.rejection_reason}
                        </div>
                      )}
                    </div>
                    
                    {doc.id === reuploadDocumentId && (
                      <div className="mt-4 pt-4 border-t">
                        <Label htmlFor={`document-${doc.id}`} className="text-sm font-medium">{t("reuploadDocument")}</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input
                            id={`document-${doc.id}`}
                            type="file"
                            onChange={(e) => handleFileUpload(e, doc.id)}
                            className="flex-1"
                          />
                          <Button size="sm" disabled={isUploading}>
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploading ? t("uploading") : t("upload")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
                         )}
           </div>
           
           <Separator className="my-6" />
           
           {/* Materials Section */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Plus className="w-5 h-5" />
                 {t("materials")}
               </CardTitle>
                                <div className="flex items-center justify-between">
                   <p className="text-sm text-muted-foreground">
                     {t("totalMaterials")}: {materials.length}
                   </p>
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-medium">{t("totalPercentage")}:</span>
                     <Badge variant={getPercentageStatus() === "complete" ? "default" : getPercentageStatus() === "exceeded" ? "destructive" : "secondary"}>
                       {totalPercentage}%
                     </Badge>
                   </div>
                 </div>
             </CardHeader>
             <CardContent>
               {materials.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">
                   {t("noMaterialsAdded")}
                 </div>
               ) : (
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>{t("material")}</TableHead>
                       <TableHead>{t("percentage")}</TableHead>
                       <TableHead>{t("recyclable")}</TableHead>
                       <TableHead>{t("description")}</TableHead>
                       <TableHead>{t("actions")}</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {materials.map((material) => (
                       <TableRow key={material.id}>
                         <TableCell className="font-medium">{material.name}</TableCell>
                         <TableCell>{material.percentage}%</TableCell>
                         <TableCell>
                           <Badge variant={material.recyclable ? "default" : "secondary"}>
                             {material.recyclable ? t("yes") : t("no")}
                           </Badge>
                         </TableCell>
                         <TableCell>{material.description}</TableCell>
                         <TableCell>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleRemoveMaterial(material.id)}
                             className="text-destructive hover:text-destructive"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               )}
             </CardContent>
           </Card>

           {/* Add Material Dialog */}
           <Dialog open={showAddMaterialDialog} onOpenChange={setShowAddMaterialDialog}>
             <DialogTrigger asChild>
               <Button size="sm" className="w-full">
                 <Plus className="h-4 w-4 mr-2" />
                 {t("addMaterial")}
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>{t("addNewMaterial")}</DialogTitle>
                 <DialogDescription>
                   {t("addNewMaterialDescription")}
                 </DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="grid gap-4 md:grid-cols-2">
                   <div>
                     <Label htmlFor="materialName">{t("materialName")}</Label>
                     <Input
                       id="materialName"
                       name="name"
                       value={newMaterial.name}
                       onChange={handleMaterialChange}
                       placeholder={t("materialNamePlaceholder")}
                     />
                   </div>
                   <div>
                     <Label htmlFor="percentage">{t("percentage")} (%)</Label>
                     <Input
                       id="percentage"
                       name="percentage"
                       type="number"
                       min="0"
                       max="100"
                       value={newMaterial.percentage}
                       onChange={handleMaterialChange}
                       placeholder="0"
                     />
                   </div>
                   <div>
                     <Label htmlFor="recyclable">{t("recyclable")}</Label>
                     <Select value={newMaterial.recyclable.toString()} onValueChange={handleRecyclableChange}>
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="true">{t("yes")}</SelectItem>
                         <SelectItem value="false">{t("no")}</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Label htmlFor="description">{t("description")}</Label>
                     <Input
                       id="description"
                       name="description"
                       value={newMaterial.description}
                       onChange={handleMaterialChange}
                       placeholder={t("materialDescriptionPlaceholder")}
                     />
                   </div>
                 </div>
               </div>
               <DialogFooter>
                 <Button variant="outline" onClick={() => setShowAddMaterialDialog(false)}>
                   {t("cancel")}
                 </Button>
                 <Button onClick={handleAddMaterial} disabled={!newMaterial.name || newMaterial.percentage <= 0}>
                   <Plus className="h-4 w-4 mr-2" />
                   {t("add")}
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
           
           <div className="flex justify-end space-x-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/products">{t("cancel")}</Link>
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Delete Document Confirmation Dialog */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteDocument")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDocumentConfirmation", { name: documentToDelete?.name || "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDeleteDocument}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}