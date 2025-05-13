"use client";

import { useTranslations } from "next-intl";
import { use } from "react";

import { DocumentDetails } from "@/components/dashboard/documents/document-details";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DocumentPage({ params }: PageProps) {
  const t = useTranslations("documentManagement");
  const resolvedParams = use(params);
  
  return (
    <div className="space-y-6">
      <DocumentDetails documentId={resolvedParams.id} />
    </div>
  );
} 