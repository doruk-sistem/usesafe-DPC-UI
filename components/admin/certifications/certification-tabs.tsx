"use client";

import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CertificationDocuments } from "./certification-documents";
import { CertificationTests } from "./certification-tests";

interface CertificationTabsProps {
  certificationId: string;
}

export function CertificationTabs({ certificationId }: CertificationTabsProps) {
  const t = useTranslations("admin.dpc");

  return (
    <Tabs defaultValue="documents" className="space-y-4">
    
      <TabsContent value="documents" className="space-y-4">
        <CertificationDocuments certificationId={certificationId} />
      </TabsContent>
      <TabsContent value="tests" className="space-y-4">
        <CertificationTests certificationId={certificationId} />
      </TabsContent>
    </Tabs>
  );
} 