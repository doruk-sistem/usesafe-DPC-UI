"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, History, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface DocumentHistoryProps {
  documentId: string;
}

interface HistoryEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  version: string;
}

export function DocumentHistory({ documentId }: DocumentHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchHistory() {
      try {
        // In a real app, this would fetch from an API
        // For now, we'll use mock data
        const mockHistory: HistoryEntry[] = [
          {
            id: "1",
            action: "Document Uploaded",
            user: "System",
            timestamp: new Date().toISOString(),
            details: "Initial document upload",
            version: "1.0",
          },
          {
            id: "2",
            action: "Status Changed",
            user: "Admin",
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            details: "Document status updated to PENDING",
            version: "1.0",
          },
        ];
        
        setHistory(mockHistory);
      } catch (error) {
        console.error("Error fetching document history:", error);
        toast({
          title: "Error",
          description: "Failed to load document history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [documentId, toast, supabase]);

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "document uploaded":
        return <History className="h-4 w-4" />;
      case "status changed":
        return <AlertTriangle className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-md" />
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-gray-200 animate-pulse" />
                  <div className="w-36 h-4 bg-gray-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/documents">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <CardTitle>Document History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No History Found</h3>
            <p className="text-muted-foreground">
              This document has no history entries.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-muted p-2 rounded-full">
                  {getActionIcon(entry.action)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{entry.action}</h4>
                    <Badge variant="outline">
                      v{entry.version}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{entry.details}</p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <span>{entry.user}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 