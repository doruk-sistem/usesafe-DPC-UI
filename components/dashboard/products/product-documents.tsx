"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQueryClient } from "@tanstack/react-query";
import {
  Download,
  FileText,
  Eye,
  History,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  getDocuments,
  approveDocument,
  rejectDocument,
  uploadDocument,
  updateDocument,
} from "@/lib/services/documents";
import { Document } from "@/lib/types/document";
import { BaseProduct } from "@/lib/types/product";
import { getStatusIcon } from "@/lib/utils/document-utils";

interface ProductDocumentsProps {
  productId: string;
}

export function ProductDocuments({
  productId,
}: ProductDocumentsProps) {
  const t = useTranslations("products.ProductDocuments");
  
  const documentTypeLabels: Record<string, string> = {
    quality_cert: t("qualityCertificate"),
    safety_cert: t("safetyCertificate"),
    test_reports: t("testReports"),
    technical_docs: t("technicalDocumentation"),
    compliance_docs: t("complianceDocuments"),
  };

  const [documents, setDocuments] = useState<Document[]>([]);
  const [product, setProduct] = useState<BaseProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [documentVersion, setDocumentVersion] = useState<string>("1.0");
  const [validUntil, setValidUntil] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

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
    }
  };

  const handleView = (doc: Document) => {
    // Open document in a new tab
    window.open(doc.url, "_blank");
  };

  const handleViewHistory = (doc: Document) => {
    // Check if document has a valid ID
    if (!doc.id) {
      return;
    }

    // Navigate to document history page
    window.location.href = `/dashboard/documents/${doc.id as string}/history`;
  };

  const handleReupload = (doc: Document) => {
    // Check if document has a valid ID
    if (!doc.id) {
      return;
    }

    // Navigate to the product edit page with a query parameter to indicate re-upload
    window.location.href = `/dashboard/products/${productId}/edit?reupload=${doc.id as string}`;
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

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast({
        title: t("error"),
        description: t("pleaseSelectFileAndType"),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadDocument(productId, selectedFile, documentType, {
        version: documentVersion,
        validUntil: validUntil,
        notes: notes,
      });

      toast({
        title: t("success"),
        description: t("documentUploadedSuccessfully"),
      });

      // Reset form
      setSelectedFile(null);
      setDocumentType("");
      setDocumentVersion("1.0");
      setValidUntil("");
      setNotes("");
      setShowUploadForm(false);

      // Refresh documents using getDocuments
      const { documents, product } = await getDocuments(productId);
      setProduct(product || null);
      setDocuments(documents);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: t("error"),
        description: t("errorUploadingDocument"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { documents, product } = await getDocuments(productId);
        setProduct(product || null);
        setDocuments(documents);
      } catch (error) {
        console.error("Error fetching product documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, toast]);

  if (isLoading) {
    return <Loading />;
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("productNotFound")}</h2>
          <p className="text-muted-foreground">
            {t("productNotFoundDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("productDocuments")}</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowUploadForm(!showUploadForm)}
              size="sm"
              className="flex items-center gap-2"
            >
              {showUploadForm ? (
                <>
                  <X className="h-4 w-4" />
                  {t("cancel")}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {t("uploadDocument")}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{product.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(product.status || "")}>
                {getStatusVariant(product.status || "").toLowerCase()}
              </Badge>
            </div>
          </div>

          {showUploadForm && (
            <div className="mb-6 p-4 border rounded-md bg-muted/30">
              <h3 className="text-lg font-medium mb-4">{t("uploadNewDocument")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType" className="flex items-center">
                    {t("documentType")} <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <select
                    id="documentType"
                    className="w-full p-2 border rounded"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="">{t("select")}</option>
                    <option value="quality_cert">{t("qualityCertificate")}</option>
                    <option value="safety_cert">{t("safetyCertificate")}</option>
                    <option value="test_reports">{t("testReports")}</option>
                    <option value="technical_docs">{t("technicalDocumentation")}</option>
                    <option value="compliance_docs">{t("complianceDocuments")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file" className="flex items-center">
                    {t("file")} <span className="text-red-500 ml-1">*</span>
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
                      {t("selectedFile")}: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-between w-full p-2"
                    onClick={() =>
                      setShowAdditionalFields(!showAdditionalFields)
                    }
                  >
                    <span>{t("additionalInfo")}</span>
                    {showAdditionalFields ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {showAdditionalFields && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-2 border rounded-md">
                      <div className="space-y-2">
                        <Label htmlFor="version">{t("version")}</Label>
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
                        <Label htmlFor="validUntil">
                          {t("validUntil")} ({t("validUntilOptional")})
                        </Label>
                        <input
                          id="validUntil"
                          type="date"
                          value={validUntil}
                          onChange={(e) => setValidUntil(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <Label htmlFor="notes">{t("notes")} ({t("notesOptional")})</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={t("documentNotesPlaceholder")}
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
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || !selectedFile || !documentType}
                  >
                    {isUploading ? t("uploading") : t("uploadDocument")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t("noDocumentsFound")}</h3>
              <p className="text-muted-foreground">
                {t("noDocumentsDescription")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%]">{t("documentName")}</TableHead>
                    <TableHead className="w-[15%]">{t("type")}</TableHead>
                    <TableHead className="w-[15%]">{t("status")}</TableHead>
                    <TableHead className="w-[15%]">{t("validUntil")}</TableHead>
                    <TableHead className="w-[10%]">{t("version")}</TableHead>
                    <TableHead className="w-[10%]">{t("notes")}</TableHead>
                    <TableHead className="w-[10%] text-right">
                      {t("actions")}
                    </TableHead>
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
                        <Badge
                          variant="secondary"
                          className="whitespace-nowrap"
                        >
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
                          : t("notAvailable")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        v{document.version}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {document.notes || t("noNotes")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">{t("openMenu")}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDownload(document)}>
                              <Download className="h-4 w-4 mr-2" />
                              {t("download")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleView(document)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t("view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewHistory(document)}>
                              <History className="h-4 w-4 mr-2" />
                              {t("viewHistory")}
                            </DropdownMenuItem>
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
            <DialogTitle>{t("documentDetails")}</DialogTitle>
            <DialogDescription>{selectedDocument?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">{t("generalInfo")}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">{t("fileSize")}:</span>
                  <p>{selectedDocument?.fileSize}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("version")}:</span>
                  <p>v{selectedDocument?.version}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("uploadDate")}:
                  </span>
                  <p>
                    {new Date(
                      selectedDocument?.uploadedAt || ""
                    ).toLocaleDateString()}
                  </p>
                </div>
                {selectedDocument?.validUntil && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("validUntil")}:
                    </span>
                    <p>
                      {new Date(
                        selectedDocument.validUntil
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedDocument?.notes && (
              <div>
                <h4 className="font-medium mb-2">{t("notes")}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDocument.notes}
                </p>
              </div>
            )}

            {selectedDocument?.rejection_reason && (
              <div>
                <h4 className="font-medium mb-2">{t("rejectionReason")}</h4>
                <p className="text-sm text-red-500">
                  {selectedDocument.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
