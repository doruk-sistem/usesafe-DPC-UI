import { Download, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - In a real app, this would come from an API
const documentsData = {
  "MFR-001": [
    {
      id: "DOC-001",
      name: "Trade Registry Gazette",
      type: "PDF",
      status: "verified",
      uploadedAt: "2024-03-15T10:30:00",
    },
    {
      id: "DOC-002",
      name: "Tax Registration Certificate",
      type: "PDF",
      status: "pending",
      uploadedAt: "2024-03-15T10:31:00",
    },
    {
      id: "DOC-003",
      name: "ISO 9001 Certificate",
      type: "PDF",
      status: "verified",
      uploadedAt: "2024-03-15T10:32:00",
    },
    {
      id: "DOC-004",
      name: "Production License",
      type: "PDF",
      status: "rejected",
      uploadedAt: "2024-03-15T10:33:00",
    },
  ],
};

interface ManufacturerDocumentsProps {
  manufacturerId: string;
}

export function ManufacturerDocuments({ manufacturerId }: ManufacturerDocumentsProps) {
  const documents = documentsData[manufacturerId] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-start gap-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{doc.type}</span>
                    <span>·</span>
                    <span>
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    doc.status === "verified"
                      ? "success"
                      : doc.status === "rejected"
                      ? "destructive"
                      : "warning"
                  }
                >
                  {doc.status}
                </Badge>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}