import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function VerifyLoading() {
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-8 w-48 mt-4" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading verification interface...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}