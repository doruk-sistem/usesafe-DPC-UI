"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, AlertCircle, Upload, FileText, Download, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
import { Product } from "@/lib/types/product";

interface ProductEditProps {
  productId: string;
  reuploadDocumentId?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  rejection_reason?: string;
  rejection_date?: string;
  file_url?: string;
  upload_date?: string;
  version?: string;
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

export function ProductEdit({ productId, reuploadDocumentId }: ProductEditProps) {
  const [product, setProduct] = useState<Product | null>(null);
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
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();

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
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (error) throw error;
        setProduct(data);
        
        // Initialize form data
        setFormData({
          name: data.name,
          model: data.model,
          product_type: data.product_type,
        });

        // Extract all documents from the product and add IDs if missing
        if (data.documents) {
          const docs = Object.entries(data.documents).flatMap(([type, documents]: [string, any[]]) => {
            return documents.map((doc: any, index: number) => {
              // Add an ID if it doesn't exist
              if (!doc.id) {
                doc.id = `doc-${type}-${index}-${Date.now()}`;
              }
              return doc;
            });
          });
          setAllDocuments(docs);
          
          // If we have a reuploadDocumentId, find the rejected document
          if (reuploadDocumentId) {
            const doc = docs.find((doc: any) => doc.id === reuploadDocumentId);
            if (doc) {
              setRejectedDocument(doc);
            }
          }
        }
      } catch (error) {
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
  }, [productId, reuploadDocumentId, toast, supabase]);

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
      
      // In a real app, this would upload to Supabase Storage
      // For now, we'll simulate the upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the document in the state
      if (documentId) {
        const updatedDocuments = allDocuments.map(doc => {
          if (doc.id === documentId) {
            return {
              ...doc,
              name: file.name,
              file_url: URL.createObjectURL(file),
              upload_date: new Date().toISOString(),
              status: "pending",
            };
          }
          return doc;
        });
        setAllDocuments(updatedDocuments);
      }
      
      toast({
        title: "Success",
        description: documentId 
          ? "Document updated successfully" 
          : "New document uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, documentName?: string, documentType?: string) => {
    try {
      // Check if documentId is valid
      if (!documentId) {
        toast({
          title: "Error",
          description: "Cannot delete document: Invalid document ID",
          variant: "destructive",
        });
        return;
      }
      
      setIsDeleting(documentId);
      
      // In a real app, this would delete from Supabase
      // For now, we'll simulate the delete process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // First, update the allDocuments state to remove the document
      const updatedAllDocuments = allDocuments.filter(doc => {
        // If the document has an ID, use it for comparison
        if (doc.id) {
          return doc.id !== documentId;
        }
        // If the document doesn't have an ID, use name and type for comparison
        return !(doc.name === documentName && doc.type === documentType);
      });
      
      setAllDocuments(updatedAllDocuments);
      
      // Then, update the product state if it exists
      if (product) {
        const productCopy = JSON.parse(JSON.stringify(product));
        
        // Find and remove the document from the appropriate category
        let documentFound = false;
        
        // If we know the document type, we can directly target that category
        if (documentType && productCopy.documents[documentType]) {
          const categoryDocs = productCopy.documents[documentType];
          const updatedCategoryDocs = categoryDocs.filter((doc: any) => {
            // If the document has an ID, use it for comparison
            if (doc.id) {
              return doc.id !== documentId;
            }
            // If the document doesn't have an ID, use name for comparison
            return doc.name !== documentName;
          });
          
          if (updatedCategoryDocs.length !== categoryDocs.length) {
            productCopy.documents[documentType] = updatedCategoryDocs;
            documentFound = true;
          }
        } else {
          // If we don't know the document type, check all categories
          for (const category in productCopy.documents) {
            const categoryDocs = productCopy.documents[category];
            const updatedCategoryDocs = categoryDocs.filter((doc: any) => {
              // If the document has an ID, use it for comparison
              if (doc.id) {
                return doc.id !== documentId;
              }
              // If the document doesn't have an ID, use name for comparison
              return doc.name !== documentName;
            });
            
            if (updatedCategoryDocs.length !== categoryDocs.length) {
              productCopy.documents[category] = updatedCategoryDocs;
              documentFound = true;
              break;
            }
          }
        }
        
        if (documentFound) {
          // Update the product state with the modified documents
          setProduct(productCopy);
          
          toast({
            title: "Success",
            description: "Document deleted successfully",
          });
        } else {
          toast({
            title: "Success",
            description: "Document removed from the list",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleAddNewDocument = async () => {
    if (!newDocument.file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // In a real app, this would upload to Supabase Storage
      // For now, we'll simulate the upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the new document to the state
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: newDocument.name,
        type: newDocument.type,
        status: "pending",
        file_url: URL.createObjectURL(newDocument.file),
        upload_date: new Date().toISOString(),
      };
      
      setAllDocuments(prev => [...prev, newDoc]);
      setNewDocument({
        file: null,
        name: "",
        type: "technical_docs",
      });
      setShowAddDialog(false);
      
      toast({
        title: "Success",
        description: "New document added successfully",
      });
    } catch (error) {
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
    
    setIsSaving(true);
    
    try {
      // Update product information using productService
      const { data, error } = await productService.updateProduct({
        id: productId,
        product: {
          name: formData.name,
          model: formData.model,
          product_type: formData.product_type,
          documents: allDocuments.reduce((acc, doc) => {
            if (!acc[doc.type]) {
              acc[doc.type] = [];
            }
            acc[doc.type].push(doc);
            return acc;
          }, {} as Record<string, any[]>),
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Product information updated successfully",
      });
      
      // Redirect back to products page
      router.push("/dashboard/products");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string | undefined | null) => {
    if (!status) return <Badge className="bg-gray-500">Pending</Badge>;
    
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500">Pending</Badge>;
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!product) return;
    
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET || '')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(process.env.NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET || '')
        .getPublicUrl(filePath);

      const newImageData = {
        url: publicUrl,
        alt: file.name,
        is_primary: !product.images?.length,
      };

      const updatedImages = [...(product.images || []), newImageData];

      const { error: updateError } = await supabase
        .from('products')
        .update({ images: updatedImages })
        .eq('id', productId);

      if (updateError) throw updateError;

      setProduct(prev => prev ? { ...prev, images: updatedImages } : null);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      setNewImage(null);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!product) return;

    try {
      const updatedImages = product.images?.filter(img => img.url !== imageUrl) || [];
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: updatedImages })
        .eq('id', productId);

      if (updateError) throw updateError;

      setProduct(prev => prev ? { ...prev, images: updatedImages } : null);
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
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
          {rejectedDocument && (
            <Alert variant="destructive" key="rejected-document-alert">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Document Rejected</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  <p key="doc-name"><strong>Document:</strong> {rejectedDocument.name}</p>
                  <p key="doc-type"><strong>Type:</strong> {rejectedDocument.type}</p>
                  <p key="doc-reason"><strong>Rejection Reason:</strong> {rejectedDocument.rejection_reason}</p>
                  <p key="doc-date"><strong>Rejection Date:</strong> {new Date(rejectedDocument.rejection_date || "").toLocaleDateString()}</p>
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
              value={formData.product_type} 
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
                  <div key={doc.id || `doc-${doc.name}-${doc.type}`} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{doc.name}</span>
                        {getStatusBadge(doc.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={doc.file_url || "#"}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            if (doc.id) {
                              handleDeleteDocument(doc.id, doc.name, doc.type);
                            } else {
                              // Generate a temporary ID if none exists
                              const tempId = `doc-${doc.name}-${doc.type}-${Date.now()}`;
                              handleDeleteDocument(tempId, doc.name, doc.type);
                            }
                          }}
                          disabled={isDeleting === (doc.id || `doc-${doc.name}-${doc.type}`)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {isDeleting === (doc.id || `doc-${doc.name}-${doc.type}`) ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div key={`doc-type-${doc.id || doc.name}`}>
                        <span className="font-medium">Type:</span> {documentTypeLabels[doc.type] || doc.type}
                      </div>
                      <div key={`doc-version-${doc.id || doc.name}`}>
                        <span className="font-medium">Version:</span> {doc.version || "1.0"}
                      </div>
                      <div key={`doc-upload-date-${doc.id || doc.name}`}>
                        <span className="font-medium">Upload Date:</span> {doc.upload_date ? new Date(doc.upload_date).toLocaleDateString() : new Date().toLocaleDateString()}
                      </div>
                      {doc.rejection_reason && (
                        <div key={`doc-rejection-reason-${doc.id || doc.name}`}>
                          <span className="font-medium">Rejection Reason:</span> {doc.rejection_reason}
                        </div>
                      )}
                    </div>
                    
                    {doc.id === reuploadDocumentId && (
                      <div className="mt-4 pt-4 border-t">
                        <Label htmlFor={`document-${doc.id || doc.name}`} className="text-sm font-medium">Re-upload Document</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input
                            id={`document-${doc.id || doc.name}`}
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
  );
}