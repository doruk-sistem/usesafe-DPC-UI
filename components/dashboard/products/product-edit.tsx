"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, AlertCircle, Upload, FileText, Download, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { productService } from "@/lib/services/product";
import { getDocuments, uploadDocument } from "@/lib/services/documents";
import { STANDARD_TO_AI_MAPPING, DOCUMENT_TYPE_CONFIG } from "@/lib/constants/documents";
import { useAllProductTypes } from "@/lib/services/product-types";
import { BaseProduct } from "@/lib/types/product";
import { Document } from "@/lib/types/document";

interface ProductEditProps {
  productId: string;
  reuploadDocumentId?: string;
}

const documentTypeLabels: Record<string, string> = {
  quality_cert: "Quality Certificate",
  safety_cert: "Safety Certificate",
  test_reports: "Test Reports",
  technical_docs: "Technical Documentation",
  compliance_docs: "Compliance Documents",
  certificates: "Certificates",
  other: "Other"
};

// Belge türünü gösterme fonksiyonu - AI türlerini destekler
const getDocumentTypeLabel = (doc: any) => {
  // Eğer originalType varsa (AI'dan gelen), onu göster
  if (doc.originalType) {
    return doc.originalType;
  }
  
  // Standart türler için label kullan
  return documentTypeLabels[doc.type] || doc.type;
};

export function ProductEdit({ productId, reuploadDocumentId }: ProductEditProps) {
  const [product, setProduct] = useState<BaseProduct | null>(null);
  const [rejectedDocument, setRejectedDocument] = useState<Document | null>(null);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
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
          title: "Error",
          description: "Failed to load product details",
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
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: "Failed to upload document",
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
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
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
        title: "Success",
        description: "Document added successfully",
      });
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!product) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          model: formData.model,
          product_type: formData.product_type,
        })
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string | undefined | null) => {
    if (!status) return null;
    
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "Pending" },
      approved: { variant: "default" as const, text: "Approved" },
      rejected: { variant: "destructive" as const, text: "Rejected" },
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
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
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
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
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
        title: "Success",
        description: "Primary image updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update primary image",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
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
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested product could not be found.
          </p>
          <Button asChild>
            <Link href="/dashboard/products">Back to Products</Link>
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
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <CardTitle>Edit Product</CardTitle>
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
                    <AlertTitle>Product Rejected</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2">
                        <p><strong>Rejection Reason:</strong> {lastHistory.reason.replace("Rejected: ", "")}</p>
                        <p><strong>Rejection Date:</strong> {new Date(lastHistory.timestamp).toLocaleDateString()}</p>
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
              <AlertTitle>Document Rejected</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  <p key="doc-name"><strong>Document:</strong> {rejectedDocument.name}</p>
                  <p key="doc-type"><strong>Type:</strong> {getDocumentTypeLabel(rejectedDocument)}</p>
                  <p key="doc-reason"><strong>Rejection Reason:</strong> {rejectedDocument.rejection_reason}</p>
                  <p key="doc-date"><strong>Rejection Date:</strong> {rejectedDocument.uploadedAt ? new Date(rejectedDocument.uploadedAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input 
              id="model" 
              value={formData.model} 
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Product Type</Label>
            <Input 
              id="product_type" 
              value={getFullProductTypeDisplay()} 
              onChange={handleInputChange}
            />
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Product Images</h3>
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
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Add New Image
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
                        {image.is_primary ? "Primary" : "Set as Primary"}
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
              <h3 className="text-lg font-semibold">Product Documents</h3>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Document</DialogTitle>
                    <DialogDescription>
                      Upload a new document for this product.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="document-file">Document File</Label>
                      <Input
                        id="document-file"
                        type="file"
                        onChange={handleNewDocumentChange}
                      />
                      {newDocument.file && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {newDocument.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document-type">Document Type</Label>
                      <Select
                        value={newDocument.type}
                        onValueChange={handleDocumentTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical_docs">Technical Documentation</SelectItem>
                          <SelectItem value="test_reports">Test Reports</SelectItem>
                          <SelectItem value="compliance_docs">Compliance Documents</SelectItem>
                          <SelectItem value="certificates">Certificates</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddNewDocument} disabled={isUploading || !newDocument.file}>
                      {isUploading ? "Uploading..." : "Upload Document"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {allDocuments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No documents found for this product.
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
                            Download
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteDocument(doc.id, doc.name, doc.type)}
                          disabled={isDeleting === doc.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {isDeleting === doc.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div key={`doc-type-${doc.id}`}>
                        <span className="font-medium">Type:</span> {getDocumentTypeLabel(doc)}
                      </div>
                      <div key={`doc-version-${doc.id}`}>
                        <span className="font-medium">Version:</span> {doc.version || "1.0"}
                      </div>
                      <div key={`doc-upload-date-${doc.id}`}>
                        <span className="font-medium">Upload Date:</span> {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "N/A"}
                      </div>
                      {doc.rejection_reason && (
                        <div key={`doc-rejection-reason-${doc.id}`}>
                          <span className="font-medium">Rejection Reason:</span> {doc.rejection_reason}
                        </div>
                      )}
                    </div>
                    
                    {doc.id === reuploadDocumentId && (
                      <div className="mt-4 pt-4 border-t">
                        <Label htmlFor={`document-${doc.id}`} className="text-sm font-medium">Re-upload Document</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input
                            id={`document-${doc.id}`}
                            type="file"
                            onChange={(e) => handleFileUpload(e, doc.id)}
                            className="flex-1"
                          />
                          <Button size="sm" disabled={isUploading}>
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploading ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/products">Cancel</Link>
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Delete Document Confirmation Dialog */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Document</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDeleteDocument}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}