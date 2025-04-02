"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface ProductDocumentsProps {
  productId: string;
}

interface Document {
  name: string;
  url: string;
  type: string;
}

interface Product {
  name: string;
  status: "DRAFT" | "NEW" | "DELETED" | "ARCHIVED";
  documents: Record<string, Document[]>;
}

const documentTypeLabels: Record<string, string> = {
  quality_cert: "Quality Certificate",
  safety_cert: "Safety Certificate",
  test_reports: "Test Reports",
  technical_docs: "Technical Documentation",
  compliance_docs: "Compliance Documents"
};

export function ProductDocuments({ productId }: ProductDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("name, status, documents")
          .eq("id", productId)
          .single();

        if (error) throw error;

        setProduct(data);

        // Flatten all document arrays into a single array
        const allDocuments: Document[] = [];
        if (data?.documents) {
          Object.entries(data.documents).forEach(([type, docs]) => {
            if (Array.isArray(docs)) {
              docs.forEach(doc => {
                allDocuments.push({
                  name: doc.name,
                  url: doc.url,
                  type: type
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
    }

    fetchProduct();
  }, [productId, toast, supabase]);

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-md" />
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-gray-200 animate-pulse" />
                  <div className="w-36 h-4 bg-gray-200 animate-pulse" />
                </div>
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
    <Card>
      <CardHeader>
        <CardTitle>Product Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{product.name}</h3>
          <Badge
            variant={
              product.status === "NEW"
                ? "success"
                : product.status === "DRAFT"
                ? "warning"
                : "destructive"
            }
          >
            {product.status.toLowerCase()}
          </Badge>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
            <p className="text-muted-foreground">
              This product has no documents attached.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{document.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {documentTypeLabels[document.type] || document.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(document)}
                      className="h-8 w-8"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 