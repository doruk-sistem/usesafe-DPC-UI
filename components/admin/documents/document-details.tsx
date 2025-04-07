"use client";

import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Mock data - In a real app, this would come from an API
const documentsData = {
  "DOC-001": {
    id: "DOC-001",
    name: "ISO 9001:2015 Certificate",
    type: "Certification",
    manufacturer: "TechFabrics Ltd",
    status: "pending",
    validUntil: "2025-03-15",
    uploadedAt: "2024-03-15T10:30:00",
    fileSize: "2.4 MB",
    version: "1.0",
    description: "Quality Management System certification for textile manufacturing processes",
    issuer: "International Standards Organization",
    verificationStatus: {
      authenticity: "verified",
      completeness: "verified",
      signature: "pending",
      expiration: "valid",
    },
  },
};

interface DocumentDetailsProps {
  documentId: string;
}

export function DocumentDetails({ documentId }: DocumentDetailsProps) {
  const { toast } = useToast();
  const document = documentsData[documentId];

  if (!document) {
    return <div>Document not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documents
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{document.name}</h1>
          <Badge
            variant={
              document.status === "approved"
                ? "success"
                : document.status === "rejected"
                ? "destructive"
                : "warning"
            }
          >
            {document.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Document ID</p>
                <p className="font-medium">{document.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="font-medium">v{document.version}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{document.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">File Size</p>
                <p className="font-medium">{document.fileSize}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uploaded</p>
                <p className="font-medium">
                  {new Date(document.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valid Until</p>
                <p className="font-medium">
                  {new Date(document.validUntil).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="mt-1">{document.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(document.verificationStatus).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key}</span>
                  <Badge
                    variant={
                      value === "verified"
                        ? "success"
                        : value === "invalid"
                        ? "destructive"
                        : "warning"
                    }
                  >
                    {value as string}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}