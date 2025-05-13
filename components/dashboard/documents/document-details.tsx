"use client";

import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase/client";
import { getStatusIcon } from "@/lib/utils/document-utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DocumentValidation } from "@/components/admin/documents/document-validation";
import { DocumentHistory } from "@/components/dashboard/documents/document-history";

interface DocumentDetailsProps {
  documentId: string;
}

export function DocumentDetails({ documentId }: DocumentDetailsProps) {
  const t = useTranslations("documentManagement");
  const { toast } = useToast();
  const { user } = useAuth();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocument() {
      console.log("Fetching document with ID:", documentId);
      console.log("User:", user);
      
      if (!user?.user_metadata?.company_id) {
        console.log("No company ID found in user metadata");
        return;
      }
      
      try {
        console.log("Fetching products for company:", user.user_metadata.company_id);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("company_id", user.user_metadata.company_id);

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Products data:", data);

        if (data) {
          // Tüm ürünlerin dökümanlarını kontrol et
          const allDocs: any[] = [];
          data.forEach(product => {
            console.log("Processing product:", product.name);
            if (product.documents) {
              console.log("Product documents:", product.documents);
              Object.values(product.documents).forEach((docsArr) => {
                if (Array.isArray(docsArr)) {
                  docsArr.forEach(doc => {
                    allDocs.push({
                      ...doc,
                      product_id: product.id,
                      product_name: product.name || product.product_name || "-"
                    });
                  });
                }
              });
            }
          });

          console.log("All documents found:", allDocs);
          console.log("Looking for document with ID:", documentId);

          // İstenen dökümanı bul
          const foundDoc = allDocs.find(doc => String(doc.id) === String(documentId));
          console.log("Found document:", foundDoc);
          
          if (foundDoc) {
            setDocument(foundDoc);
          } else {
            console.log("Document not found in the results");
          }
        }
      } catch (error) {
        console.error("Error in fetchDocument:", error);
        toast({
          title: "Error",
          description: "Failed to fetch document details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [documentId, toast, t, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!document) {
    return <div>{t("repository.noData.title")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("repository.details.backToList")}
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{document.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(document.url, "_blank")}>
            <Download className="mr-2 h-4 w-4" />
            {t("repository.actions.download")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("repository.details.documentInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>{t("repository.details.name")}</Label>
                <p className="text-sm text-muted-foreground">{document.name}</p>
              </div>
              <div>
                <Label>{t("repository.details.status")}</Label>
                <Badge variant="outline" className="flex w-fit items-center gap-1">
                  {getStatusIcon(document.status)}
                  {document.status}
                </Badge>
              </div>
              <div>
                <Label>{t("repository.details.type")}</Label>
                <p className="text-sm text-muted-foreground">{document.type}</p>
              </div>
              <div>
                <Label>{t("repository.details.version")}</Label>
                <p className="text-sm text-muted-foreground">v{document.version}</p>
              </div>
              {document.validUntil && (
                <div>
                  <Label>{t("repository.details.validUntil")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(document.validUntil).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <Label>{t("repository.details.product")}</Label>
                <p className="text-sm text-muted-foreground">{document.product_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sekmeli yapı: Doğrulama & Geçmiş */}
      <Tabs defaultValue="validation" className="mt-6">
        <TabsList>
          <TabsTrigger value="validation">{t("repository.tabs.validation")}</TabsTrigger>
          <TabsTrigger value="history">{t("repository.tabs.history")}</TabsTrigger>
        </TabsList>
        <TabsContent value="validation">
          <DocumentValidation documentId={document.id} />
        </TabsContent>
        <TabsContent value="history">
          <DocumentHistory documentId={document.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 