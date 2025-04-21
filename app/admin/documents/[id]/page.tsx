"use client";

import { useTranslations } from "next-intl";
import { use } from "react";

import { DocumentDetails } from "@/components/admin/documents/document-details";
import { DocumentHistory } from "@/components/admin/documents/document-history";
import { DocumentValidation } from "@/components/admin/documents/document-validation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DocumentPage(props: { params: Promise<{ id: string }> }) {
  const t = useTranslations("documentManagement.repository");
  const params = use(props.params);
  
  return (
    <div className="space-y-6">
      <DocumentDetails documentId={params.id} />
      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="validation">{t("tabs.validation")}</TabsTrigger>
          <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
        </TabsList>
        <TabsContent value="validation" className="space-y-4">
          <DocumentValidation documentId={params.id} />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <DocumentHistory documentId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}