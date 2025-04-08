"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    type: string;
    status: string;
    url?: string;
    rejection_reason?: string;
  };
}

export function DocumentPreviewDialog({ isOpen, onClose, document }: DocumentPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>{document.name}</DialogTitle>
          <DialogDescription>Document information and status</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Belge Bilgileri */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Document ID</p>
              <div className="font-medium">{document.id}</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <div className="font-medium">{document.type}</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="font-medium">
                <Badge variant={document.status === "REJECTED" ? "destructive" : "default"}>
                  {document.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Ret Nedeni (varsa) */}
          {document.rejection_reason && (
            <div>
              <p className="text-sm text-muted-foreground">Rejection Reason</p>
              <div className="mt-1 p-2 bg-red-50 text-red-800 rounded-md">
                {document.rejection_reason}
              </div>
            </div>
          )}

          {/* PDF Görüntüleyici */}
          <div className="mt-4 border rounded-lg overflow-hidden h-[500px]">
            {document.url ? (
              <iframe
                src={document.url}
                className="w-full h-full"
                title={document.name}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Document preview not available
              </div>
            )}
          </div>

          {/* İndirme Butonu */}
          {document.url && (
            <div className="flex justify-end">
              <Button variant="outline" asChild>
                <a href={document.url} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download Document
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 