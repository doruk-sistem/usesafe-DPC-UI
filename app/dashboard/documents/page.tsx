"use client";

import { DocumentList } from "@/components/dashboard/documents/document-list";
import { DocumentHeader } from "@/components/dashboard/documents/document-header";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <DocumentHeader />
      <DocumentList />
    </div>
  );
}