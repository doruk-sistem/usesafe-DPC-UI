"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentHistory } from "@/components/dashboard/documents/document-history";
import { useAuth } from "@/lib/hooks/use-auth";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  status: string;
  validUntil: string | null;
  uploadedAt: string;
  fileSize: string;
  issuer: string;
  rejectionReason?: string;
  product_id: string;
  product_name: string;
  url?: string;
  version?: string;
}

export default function DocumentDetailsPage() {
  const t = useTranslations("documentManagement.repository");
  const { user } = useAuth();
  const params = useParams();
  const id = params?.id as string;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");

  useEffect(() => {
    async function fetchDocument() {
      if (!user?.user_metadata?.company_id) {
        console.log("No company ID found in user metadata");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching document with ID:", id);
        
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("company_id", user.user_metadata.company_id);

        if (productsError) {
          console.error("Error fetching products:", productsError);
          setLoading(false);
          return;
        }

        console.log("Products data:", productsData);

        let foundDocument: Document | null = null;

        for (const product of productsData) {
          if (!product.documents) continue;
          
          for (const [docType, docsArr] of Object.entries(product.documents)) {
            if (!Array.isArray(docsArr)) continue;
            
            const found = docsArr.find((doc: any, index: number) => {
              const docId = doc.id ? String(doc.id) : `doc-${product.id}-${doc.type || 'unknown'}-${index}`;
              const searchId = String(id);
              console.log("Comparing document IDs:", { 
                docId, 
                searchId,
                docType,
                productName: product.name,
                rawDocId: doc.id
              });
              return docId === searchId;
            });

            if (found) {
              foundDocument = {
                id: found.id || `doc-${Date.now()}-${Math.random()}`,
                name: found.name || 'Unnamed Document',
                type: found.type || docType || 'unknown',
                category: found.category || found.type || docType || 'unknown',
                status: found.status || 'pending',
                validUntil: found.validUntil || null,
                uploadedAt: found.uploadedAt || found.updatedAt || new Date().toISOString(),
                fileSize: found.fileSize || '0 KB',
                issuer: found.issuer || '-',
                rejectionReason: found.rejection_reason || found.rejectionReason,
                product_id: product.id,
                product_name: product.name || product.product_name || '-',
                url: found.url || found.file_url || null,
                version: found.version || '1.0'
              };
              break;
            }
          }
          
          if (foundDocument) break;
        }

        if (foundDocument) {
          console.log("Found document:", foundDocument);
          setDocument(foundDocument);
        } else {
          console.log("Document not found");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Unexpected error in fetchDocument:", {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        setLoading(false);
      }
    }
    fetchDocument();
  }, [id, user]);

  if (loading) return <div>Loading...</div>;
  if (!document) return <div>{t("noData.title")}</div>;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("details.backToList")}
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{document.name}</h1>
          <Badge variant={getStatusVariant(document.status)}>
            {t(`status.${document.status}`)}
          </Badge>
        </div>
        <div className="flex gap-2">
          {document.url && (
            <Button variant="outline" asChild>
              <a href={document.url} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                {t("actions.download")}
              </a>
            </Button>
          )}
        </div>
      </div>
      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="validation">{t("tabs.validation")}</TabsTrigger>
          <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
        </TabsList>
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("details.documentInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>{t("details.name")}</Label>
                  <p className="text-sm text-muted-foreground">{document.name}</p>
                </div>
                <div>
                  <Label>{t("details.status")}</Label>
                  <p className="text-sm text-muted-foreground">{t(`status.${document.status}`)}</p>
                </div>
                {document.status === "pending" && (
                  <div>
                    <Label htmlFor="comment">{t("details.comment")}</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t("details.commentPlaceholder")}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <DocumentHistory documentId={document.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 