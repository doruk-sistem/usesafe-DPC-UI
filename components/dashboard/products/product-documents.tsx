"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQueryClient } from "@tanstack/react-query";
import {
  Download,
  FileText,
  Eye,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Plus,
  MoreVertical,
  Edit,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { updateDocumentStatus } from "@/lib/hooks/use-documents";

interface ProductDocumentsProps {
  productId: string;
  showApprovalOptions?: boolean;
}

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  status: "approved" | "pending" | "rejected" | "expired";
  validUntil?: string;
  version: string;
  uploadedAt: string;
  fileSize: string;
  rejection_reason?: string;
  notes?: string;
}

interface Product {
  name: string;
  status: "DRAFT" | "NEW" | "DELETED" | "ARCHIVED";
  documents: Record<string, Document[]>;
  manufacturer_id?: string;
}

const documentTypeLabels: Record<string, string> = {
  quality_cert: "Quality Certificate",
  safety_cert: "Safety Certificate",
  test_reports: "Test Reports",
  technical_docs: "Technical Documentation",
  compliance_docs: "Compliance Documents",
};

export function ProductDocuments({
  productId,
  showApprovalOptions = false,
}: ProductDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [documentVersion, setDocumentVersion] = useState<string>("1.0");
  const [validUntil, setValidUntil] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showManufacturerDialog, setShowManufacturerDialog] = useState(false);
  const [manufacturer, setManufacturer] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  useEffect(() => {}, [showApprovalOptions]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("name, status, documents, manufacturer_id")
        .eq("id", productId)
        .single();

      if (error) throw error;

      setProduct(data);
      setManufacturer(data.manufacturer_id || "");

      // Flatten all document arrays into a single array
      const allDocuments: Document[] = [];
      if (data?.documents) {
        Object.entries(data.documents).forEach(([type, docs]) => {
          if (Array.isArray(docs)) {
            docs.forEach((doc) => {
              allDocuments.push({
                id:
                  doc.id ||
                  `doc-${Date.now()}-${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                name: doc.name,
                url: doc.url,
                type: type,
                status: doc.status || "pending",
                validUntil: doc.validUntil,
                version: doc.version || "1.0",
                uploadedAt: doc.uploadedAt || new Date().toISOString(),
                fileSize: doc.fileSize || "N/A",
                rejection_reason: doc.rejection_reason,
                notes: doc.notes,
              });
            });
          }
        });
      }
      setDocuments(allDocuments);
    } catch (error) {
      console.error("Error fetching product documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId, supabase, toast]);

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleView = (doc: Document) => {
    // Open document in a new tab
    window.open(doc.url, "_blank");
  };

  const handleViewHistory = (doc: Document) => {
    // Check if document has a valid ID
    if (!doc.id) {
      toast({
        title: "Error",
        description: "Document ID is missing",
        variant: "destructive",
      });
      return;
    }

    // Navigate to document history page
    window.location.href = `/dashboard/documents/${doc.id}/history`;
  };

  const handleReupload = (doc: Document) => {
    // Navigate to the product edit page with a query parameter to indicate re-upload
    window.location.href = `/dashboard/products/${productId}/edit?reupload=${doc.id}`;
  };

  const handleApproveDocument = async (doc: Document) => {
    try {
      // Doğrudan Supabase'e güncelleme yap
      const supabase = createClientComponentClient();

      // Önce ürünü al
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;
      if (!product) throw new Error("Product not found");

      // Belgeleri güncelle
      const updatedDocuments = { ...product.documents };
      let documentFound = false;

      // Belge tipine göre arama yap
      if (doc.type && updatedDocuments[doc.type]) {
        const documentArray = updatedDocuments[doc.type];

        // Belge adına göre eşleştir
        const documentIndex = documentArray.findIndex(
          (d: any) => d.name === doc.name
        );

        if (documentIndex !== -1) {
          // Belgeyi güncelle
          updatedDocuments[doc.type][documentIndex] = {
            ...updatedDocuments[doc.type][documentIndex],
            status: "approved",
            updatedAt: new Date().toISOString(),
          };
          documentFound = true;
        }
      }

      if (!documentFound) {
        throw new Error(`Document with name ${doc.name} not found in product`);
      }

      // Ürünü güncelle
      const { error: updateError } = await supabase
        .from("products")
        .update({ documents: updatedDocuments })
        .eq("id", productId);

      if (updateError) throw updateError;

      // Update local state
      setDocuments(
        documents.map((d) => {
          if (d.id === doc.id) {
            return { ...d, status: "approved" };
          }
          return d;
        })
      );

      // Invalidate the product query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["product", productId] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast({
        title: "Başarılı",
        description: "Belge onaylandı",
      });
    } catch (error) {
      console.error("Error approving document:", error);
      toast({
        title: "Hata",
        description:
          "Belge onaylanırken bir hata oluştu: " +
          (error instanceof Error ? error.message : JSON.stringify(error)),
        variant: "destructive",
      });
    }
  };

  const handleRejectDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedDocument) return;

    try {
      // Doğrudan Supabase'e güncelleme yap
      const supabase = createClientComponentClient();

      // Önce ürünü al
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;
      if (!product) throw new Error("Product not found");

      // Belgeleri güncelle
      const updatedDocuments = { ...product.documents };
      let documentFound = false;

      // Belge tipine göre arama yap
      if (selectedDocument.type && updatedDocuments[selectedDocument.type]) {
        const documentArray = updatedDocuments[selectedDocument.type];

        // Belge adına göre eşleştir
        const documentIndex = documentArray.findIndex(
          (d: any) => d.name === selectedDocument.name
        );

        if (documentIndex !== -1) {
          // Belgeyi güncelle
          updatedDocuments[selectedDocument.type][documentIndex] = {
            ...updatedDocuments[selectedDocument.type][documentIndex],
            status: "rejected",
            rejection_reason: rejectionReason,
            rejected_at: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          documentFound = true;
        }
      }

      if (!documentFound) {
        throw new Error(
          `Document with name ${selectedDocument.name} not found in product`
        );
      }

      // Ürünü güncelle
      const { error: updateError } = await supabase
        .from("products")
        .update({ documents: updatedDocuments })
        .eq("id", productId);

      if (updateError) throw updateError;

      // Update local state
      setDocuments(
        documents.map((d) => {
          if (d.id === selectedDocument.id) {
            return {
              ...d,
              status: "rejected",
              rejection_reason: rejectionReason,
              rejected_at: new Date().toISOString(),
            };
          }
          return d;
        })
      );

      // Invalidate the product query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["product", productId] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast({
        title: "Başarılı",
        description: "Belge reddedildi",
      });

      setShowRejectDialog(false);
      setSelectedDocument(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast({
        title: "Hata",
        description:
          "Belge reddedilirken bir hata oluştu: " +
          (error instanceof Error ? error.message : JSON.stringify(error)),
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ARCHIVED":
        return "approved";
      case "DELETED":
        return "rejected";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ARCHIVED":
        return "success";
      case "DELETED":
        return "destructive";
      case "NEW":
        return "success";
      case "DRAFT":
        return "warning";
      default:
        return "default";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !documentType) {
      toast({
        title: "Hata",
        description: "Lütfen dosya ve belge tipini seçin",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${productId}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-documents')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-documents')
        .getPublicUrl(filePath);

      const newDocument: Document = {
        id: fileName,
        name: selectedFile.name,
        url: publicUrl,
        type: documentType,
        status: "pending",
        version: documentVersion,
        uploadedAt: new Date().toISOString(),
        fileSize: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        validUntil: validUntil || undefined,
        notes: notes || undefined,
      };

      const { error: updateError } = await supabase
        .from('products')
        .update({
          documents: {
            ...product?.documents,
            [documentType]: [...(product?.documents[documentType] || []), newDocument],
          },
        })
        .eq('id', productId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      toast({
        title: "Başarılı",
        description: "Belge başarıyla yüklendi",
      });

      // Reset form
      setSelectedFile(null);
      setDocumentType("");
      setDocumentVersion("1.0");
      setValidUntil("");
      setNotes("");
      setShowUploadForm(false);
      setShowAdditionalFields(false);

      // Refresh documents
      fetchProduct();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Hata",
        description: "Belge yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateManufacturer = async () => {
    if (!productId) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ manufacturer_id: manufacturer })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Üretici bilgisi güncellendi",
      });

      setShowManufacturerDialog(false);
      fetchProduct();
    } catch (error) {
      console.error('Error updating manufacturer:', error);
      toast({
        title: "Hata",
        description: "Üretici bilgisi güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground">
            The requested product could not be found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Product Documents</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowManufacturerDialog(true)}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Alt Üretici Ekle/Düzenle
            </Button>
            <Button
              onClick={() => setShowUploadForm(!showUploadForm)}
              size="sm"
              className="flex items-center gap-2"
            >
              {showUploadForm ? (
                <>
                  <X className="h-4 w-4" />
                  İptal
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Belge Yükle
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{product.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(product.status)}>
                {getStatusDisplay(product.status).toLowerCase()}
              </Badge>
            </div>
          </div>

          {showUploadForm && (
            <div className="mb-6 p-4 border rounded-md bg-muted/30">
              <h3 className="text-lg font-medium mb-4">Yeni Belge Yükle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType" className="flex items-center">
                    Belge Tipi <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <select
                    id="documentType"
                    className="w-full p-2 border rounded"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="">Seçiniz</option>
                    <option value="quality_cert">Kalite Belgesi</option>
                    <option value="safety_cert">Güvenlik Belgesi</option>
                    <option value="test_reports">Test Raporları</option>
                    <option value="technical_docs">Teknik Dokümantasyon</option>
                    <option value="compliance_docs">Uyumluluk Belgeleri</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file" className="flex items-center">
                    Dosya <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="w-full p-2 border rounded"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Seçilen dosya: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-between w-full p-2"
                    onClick={() => setShowAdditionalFields(!showAdditionalFields)}
                  >
                    <span>Ek Bilgiler</span>
                    {showAdditionalFields ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {showAdditionalFields && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-2 border rounded-md">
                      <div className="space-y-2">
                        <Label htmlFor="version">Versiyon</Label>
                        <input
                          id="version"
                          type="text"
                          value={documentVersion}
                          onChange={(e) => setDocumentVersion(e.target.value)}
                          placeholder="1.0"
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="validUntil">Geçerlilik Tarihi (Opsiyonel)</Label>
                        <input
                          id="validUntil"
                          type="date"
                          value={validUntil}
                          onChange={(e) => setValidUntil(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Belge hakkında notlar..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUploadForm(false);
                      setSelectedFile(null);
                      setDocumentType("");
                      setDocumentVersion("1.0");
                      setValidUntil("");
                      setNotes("");
                      setShowAdditionalFields(false);
                    }}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleUploadDocument}
                    disabled={isUploading || !selectedFile || !documentType}
                  >
                    {isUploading ? "Yükleniyor..." : "Belge Yükle"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
              <p className="text-muted-foreground">
                This product has no documents attached.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Document Name</TableHead>
                    <TableHead className="w-[15%]">Type</TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                    <TableHead className="w-[15%]">Valid Until</TableHead>
                    <TableHead className="w-[10%]">Version</TableHead>
                    <TableHead className="w-[15%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document, index) => (
                    <TableRow key={index}>
                      <TableCell className="max-w-[200px] truncate">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p 
                                    className="font-medium truncate cursor-pointer hover:text-primary"
                                    onClick={() => {
                                      setSelectedDocument(document);
                                      setShowDocumentDetails(true);
                                    }}
                                  >
                                    {document.name}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="start">
                                  <p className="max-w-[300px] break-words text-xs">
                                    {document.name}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <p className="text-xs text-muted-foreground truncate">
                              {document.fileSize}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {documentTypeLabels[document.type] || document.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(document.status)}
                          className="flex w-fit items-center gap-1 whitespace-nowrap"
                        >
                          {getStatusIcon(document.status)}
                          {document.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {document.validUntil
                          ? new Date(document.validUntil).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">v{document.version}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDownload(document)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleView(document)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewHistory(document)}
                            >
                              <History className="h-4 w-4 mr-2" />
                              View History
                            </DropdownMenuItem>
                            {showApprovalOptions && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleApproveDocument(document)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                  Onayla
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRejectDocument(document)}
                                >
                                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                  Reddet
                                </DropdownMenuItem>
                              </>
                            )}
                            {showApprovalOptions &&
                              document.status === "rejected" && (
                                <DropdownMenuItem
                                  onClick={() => handleReupload(document)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Yeniden Yükle
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Belge Detay Dialog'u */}
      <Dialog open={showDocumentDetails} onOpenChange={setShowDocumentDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Belge Detayları</DialogTitle>
            <DialogDescription>
              {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Genel Bilgiler</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Dosya Boyutu:</span>
                  <p>{selectedDocument?.fileSize}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Versiyon:</span>
                  <p>v{selectedDocument?.version}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Yüklenme Tarihi:</span>
                  <p>{new Date(selectedDocument?.uploadedAt || "").toLocaleDateString()}</p>
                </div>
                {selectedDocument?.validUntil && (
                  <div>
                    <span className="text-muted-foreground">Geçerlilik Tarihi:</span>
                    <p>{new Date(selectedDocument.validUntil).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedDocument?.notes && (
              <div>
                <h4 className="font-medium mb-2">Notlar</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDocument.notes}
                </p>
              </div>
            )}

            {selectedDocument?.rejection_reason && (
              <div>
                <h4 className="font-medium mb-2">Red Nedeni</h4>
                <p className="text-sm text-red-500">
                  {selectedDocument.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showApprovalOptions && (
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Belgeyi Reddet</DialogTitle>
              <DialogDescription>
                Lütfen reddetme sebebini belirtin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="rejection-reason">Reddetme Sebebi</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reddetme sebebini girin..."
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
              >
                İptal
              </Button>
              <Button variant="destructive" onClick={handleRejectConfirm}>
                Reddet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Üretici Dialog'u */}
      <Dialog open={showManufacturerDialog} onOpenChange={setShowManufacturerDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alt Üretici Bilgisi</DialogTitle>
            <DialogDescription>
              Ürün için alt üretici bilgisini girin veya düzenleyin
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Alt Üretici</Label>
              <input
                id="manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="Alt üretici adı"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowManufacturerDialog(false)}
            >
              İptal
            </Button>
            <Button onClick={handleUpdateManufacturer}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
