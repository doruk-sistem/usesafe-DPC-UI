import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Package, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { DocumentStatus } from "@/lib/types/document";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface ProductDetailsProps {
  params: {
    id: string;
  };
}

interface Document {
  id: string;
  name: string;
  status: DocumentStatus;
  type?: string;
  validUntil?: string;
  rejection_reason?: string;
  [key: string]: any;
}

export default async function ProductDetailsPage({ params }: ProductDetailsProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  try {
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        manufacturer:manufacturer_id (
          id,
          name
        )
      `)
      .eq("id", params.id)
      .single();

    if (error || !product) {
      console.error("Error fetching product:", error);
      notFound();
    }

    // Döküman durumunu ve sayısını hesapla
    let documentCount = 0;
    let documentStatus = "No Documents";
    let hasRejectedDocuments = false;
    let hasPendingDocuments = false;
    let hasExpiredDocuments = false;
    let hasApprovedDocuments = false;
    const allDocuments: Document[] = [];

    if (product.documents) {
      // Dökümanları düzleştir
      if (Array.isArray(product.documents)) {
        allDocuments.push(...(product.documents as Document[]));
      } else if (typeof product.documents === "object") {
        Object.entries(product.documents).forEach(([docType, docList]) => {
          if (Array.isArray(docList)) {
            const typedDocs = (docList as Document[]).map(doc => ({
              ...doc,
              type: docType
            }));
            allDocuments.push(...typedDocs);
          }
        });
      }
      
      documentCount = allDocuments.length;
      
      if (documentCount > 0) {
        // Döküman durumlarını kontrol et
        allDocuments.forEach(doc => {
          // Durumu küçük harfe çevirerek kontrol et
          const status = (doc.status || "").toLowerCase();
          
          if (status === "rejected") {
            hasRejectedDocuments = true;
          } else if (status === "pending") {
            hasPendingDocuments = true;
          } else if (status === "expired") {
            hasExpiredDocuments = true;
          } else if (status === "approved") {
            hasApprovedDocuments = true;
          }
        });
        
        // Genel durumu belirle
        if (hasRejectedDocuments) {
          documentStatus = "Has Rejected Documents";
        } else if (hasPendingDocuments) {
          documentStatus = "Pending Review";
        } else if (hasExpiredDocuments) {
          documentStatus = "Has Expired Documents";
        } else if (hasApprovedDocuments) {
          documentStatus = "All Approved";
        } else {
          documentStatus = "Unknown Status";
        }
      }
    }

    // Debug için döküman durumlarını konsola yazdır
    console.log("Document Status Debug:", {
      documentCount,
      documentStatus,
      hasRejectedDocuments,
      hasPendingDocuments,
      hasExpiredDocuments,
      hasApprovedDocuments,
      allDocuments: allDocuments.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        status: doc.status,
        statusLower: (doc.status || "").toLowerCase()
      }))
    });

    // Debug için ürün durumunu konsola yazdır
    console.log("Product Status Debug:", {
      productId: product.id,
      status: product.status,
      statusType: typeof product.status,
      statusUpperCase: product.status ? product.status.toUpperCase() : null
    });

    // Ürün durumunu döküman durumlarına göre güncelle
    const updateProductStatus = () => {
      if (hasRejectedDocuments) {
        product.status = "REJECTED";
      } else if (hasPendingDocuments) {
        product.status = "PENDING";
      } else if (hasApprovedDocuments) {
        product.status = "APPROVED";
      } else {
        product.status = "NEW";
      }
    };

    updateProductStatus();

    // Döküman durumuna göre ikon ve renk belirleme
    const getStatusIcon = (status: DocumentStatus | string) => {
      const statusLower = (status || "").toLowerCase();
      switch (statusLower) {
        case "approved":
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case "rejected":
          return <XCircle className="h-4 w-4 text-red-500" />;
        case "pending":
          return <Clock className="h-4 w-4 text-yellow-500" />;
        case "expired":
          return <AlertCircle className="h-4 w-4 text-red-500" />;
        default:
          return <FileText className="h-4 w-4 text-gray-500" />;
      }
    };

    const getStatusColor = (status: DocumentStatus | string) => {
      const statusLower = (status || "").toLowerCase();
      switch (statusLower) {
        case "approved":
          return "bg-green-100 text-green-800 hover:bg-green-200";
        case "rejected":
          return "bg-red-100 text-red-800 hover:bg-red-200";
        case "pending":
          return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
        case "expired":
          return "bg-red-100 text-red-800 hover:bg-red-200";
        default:
          return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">
                Back to Products
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <Badge variant="outline">{product.product_type}</Badge>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/admin/documents?product=${product.id}`}>
                <FileText className="mr-2 h-4 w-4" />
                View Documents
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product ID</p>
                  <p className="font-medium">{product.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">{product.manufacturer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{product.product_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="font-medium">
                    {product.status ? (
                      <Badge variant="outline" className="capitalize">
                        {product.status}
                      </Badge>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {product.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Documents</span>
                  <Badge variant="secondary">
                    {documentCount} documents
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Document Status</span>
                  <Badge
                    variant={
                      documentStatus === "All Approved"
                        ? "success"
                        : documentStatus === "Pending Review"
                        ? "warning"
                        : documentStatus === "Has Rejected Documents"
                        ? "destructive"
                        : documentStatus === "Has Expired Documents"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {documentStatus}
                  </Badge>
                </div>
                
                {documentCount > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Documents</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {allDocuments.map((doc, index) => (
                        <Dialog key={`${doc.id}-${index}`}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className={`w-full justify-start ${getStatusColor(doc.status)}`}
                            >
                              <div className="flex items-center gap-2 w-full">
                                {getStatusIcon(doc.status)}
                                <span className="truncate">{doc.name || doc.type || "Unnamed Document"}</span>
                                <Badge 
                                  variant="outline" 
                                  className="ml-auto"
                                >
                                  {doc.status}
                                </Badge>
                              </div>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{doc.name || doc.type || "Document Details"}</DialogTitle>
                              <DialogDescription>
                                Document information and status
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Document ID</p>
                                  <div className="font-medium">{doc.id}</div>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Type</p>
                                  <div className="font-medium">{doc.type || "N/A"}</div>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  <div className="font-medium">
                                    <Badge
                                      variant={
                                        doc.status === "approved"
                                          ? "success"
                                          : doc.status === "pending"
                                          ? "warning"
                                          : "destructive"
                                      }
                                    >
                                      {doc.status}
                                    </Badge>
                                  </div>
                                </div>
                                {doc.validUntil && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Valid Until</p>
                                    <div className="font-medium">
                                      {new Date(doc.validUntil).toLocaleDateString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {doc.rejection_reason && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Rejection Reason</p>
                                  <div className="mt-1 p-2 bg-red-50 text-red-800 rounded-md">
                                    {doc.rejection_reason}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" asChild>
                                  <a 
                                    href={doc.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    View Document
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ProductDetailsPage:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-semibold text-destructive">Error Loading Product</h2>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
      </div>
    );
  }
} 