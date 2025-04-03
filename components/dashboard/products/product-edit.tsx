"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, AlertCircle, Upload, FileText, Download, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { productsApiHooks } from "@/lib/hooks/use-products";
import type { Product } from "@/lib/types/product";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  model: z.string().min(2, "Model must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  product_type: z.string().min(2, "Product type must be at least 2 characters"),
  status: z.enum(["DRAFT", "NEW", "DELETED", "ARCHIVED"]),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductEditProps {
  product: Product;
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

export function ProductEdit({ product: initialProduct }: ProductEditProps) {
  const supabase = createClientComponentClient();
  const t = useTranslations("productManagement");
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialProduct.name,
      model: initialProduct.model,
      description: initialProduct.description,
      product_type: initialProduct.product_type,
      status: initialProduct.status,
    },
  });

  const { mutate: updateProduct } = productsApiHooks.useUpdateProductMutation({
    onSuccess: () => {
      toast({
        title: t("edit.success.title"),
        description: t("edit.success.description"),
      });
      router.push("/dashboard/products");
    },
    onError: (error) => {
      toast({
        title: t("edit.error.title"),
        description: error instanceof Error ? error.message : t("edit.error.description"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (values: FormValues) => {
    setIsLoading(true);
    updateProduct({
      id: initialProduct.id,
      product: {
        ...values,
        id: initialProduct.id,
      },
    });
  };

  const [product, setProduct] = useState<Product | null>(null);
  const [rejectedDocument, setRejectedDocument] = useState<Document | null>(null);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", initialProduct.id)
          .single();

        if (error) throw error;
        setProduct(data);
        
        // Initialize form data
        form.reset({
          name: data.name,
          model: data.model,
          description: data.description,
          product_type: data.product_type,
          status: data.status,
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
          if (data.rejected_document_id) {
            const doc = docs.find((doc: any) => doc.id === data.rejected_document_id);
            if (doc) {
              setRejectedDocument(doc);
            }
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
  }, [initialProduct.id, toast, supabase, form]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    form.reset({
      ...form.getValues(),
      [id]: value
    });
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
      console.error("Error uploading file:", error);
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
        console.error("Invalid document ID:", documentId);
        toast({
          title: "Error",
          description: "Cannot delete document: Invalid document ID",
          variant: "destructive",
        });
        return;
      }
      
      setIsDeleting(documentId);
      
      console.log("Deleting document with ID:", documentId);
      console.log("Document name:", documentName);
      console.log("Document type:", documentType);
      console.log("Current product state:", product);
      console.log("Current allDocuments state:", allDocuments);
      
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
      
      console.log("Updated allDocuments:", updatedAllDocuments);
      setAllDocuments(updatedAllDocuments);
      
      // Then, update the product state if it exists
      if (product) {
        const productCopy = JSON.parse(JSON.stringify(product));
        console.log("Product copy before deletion:", productCopy);
        
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
            console.log(`Document found and removed from category: ${documentType}`);
            productCopy.documents[documentType] = updatedCategoryDocs;
            documentFound = true;
          }
        } else {
          // If we don't know the document type, check all categories
          for (const category in productCopy.documents) {
            console.log(`Checking category: ${category}`);
            console.log(`Documents in category:`, productCopy.documents[category]);
            
            const categoryDocs = productCopy.documents[category];
            const updatedCategoryDocs = categoryDocs.filter((doc: any) => {
              // If the document has an ID, use it for comparison
              if (doc.id) {
                return doc.id !== documentId;
              }
              // If the document doesn't have an ID, use name for comparison
              return doc.name !== documentName;
            });
            
            console.log(`Documents after filtering:`, updatedCategoryDocs);
            
            if (updatedCategoryDocs.length !== categoryDocs.length) {
              console.log(`Document found and removed from category: ${category}`);
              productCopy.documents[category] = updatedCategoryDocs;
              documentFound = true;
              break;
            }
          }
        }
        
        if (documentFound) {
          // Update the product state with the modified documents
          console.log("Product copy after deletion:", productCopy);
          setProduct(productCopy);
          
          toast({
            title: "Success",
            description: "Document deleted successfully",
          });
        } else {
          console.error("Document not found in any category");
          // Even if the document is not found in the product, we've already removed it from allDocuments
          // So we can still consider the operation successful
          toast({
            title: "Success",
            description: "Document removed from the list",
          });
        }
      } else {
        // If there's no product state, we've already removed the document from allDocuments
        toast({
          title: "Success",
          description: "Document removed from the list",
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
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
    
    setIsSaving(true);
    
    try {
      // Update product information
      const { error } = await supabase
        .from("products")
        .update({
          name: form.getValues().name,
          model: form.getValues().model,
          product_type: form.getValues().product_type,
          description: form.getValues().description,
          status: form.getValues().status,
          documents: allDocuments.reduce((acc, doc) => {
            if (!acc[doc.type]) {
              acc[doc.type] = [];
            }
            acc[doc.type].push(doc);
            return acc;
          }, {} as Record<string, any[]>),
        })
        .eq("id", product.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Product information updated successfully",
      });
      
      // Redirect back to products page
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error saving changes:", error);
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
    if (!status) return <Badge>Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!product) return;
    
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${product.id}-${Date.now()}.${fileExt}`;
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
        .eq('id', product.id);

      if (updateError) throw updateError;

      setProduct(prev => prev ? { ...prev, images: updatedImages } : null);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
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
        .eq('id', product.id);

      if (updateError) throw updateError;

      setProduct(prev => prev ? { ...prev, images: updatedImages } : null);
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
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
        .eq('id', product.id);

      if (updateError) throw updateError;

      setProduct(prev => prev ? { ...prev, images: updatedImages } : null);
      toast({
        title: "Success",
        description: "Primary image updated successfully",
      });
    } catch (error) {
      console.error('Error updating primary image:', error);
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
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("edit.title")}</CardTitle>
          <CardDescription>{t("edit.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("edit.form.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("edit.form.model")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("edit.form.description")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="product_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("edit.form.productType")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("edit.form.status")}</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="NEW">New</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : t("edit.form.submit")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 