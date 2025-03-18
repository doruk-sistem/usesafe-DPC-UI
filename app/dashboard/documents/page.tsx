"use client";

import { DocumentHeader } from "@/components/dashboard/documents/document-header";
import { DocumentList } from "@/components/dashboard/documents/document-list";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <DocumentHeader />
      <DocumentList />
    </div>
  );
}