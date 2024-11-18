import { Clock, FileCheck, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

export default function PendingApprovalPage() {
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <Clock className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-2xl font-semibold">Application Under Review</h1>
            
            <div className="space-y-2 text-muted-foreground">
              <p>Thank you for completing your registration with UseSafe.</p>
              <p>Our team is currently reviewing your application and documents.</p>
            </div>

            <div className="w-full space-y-4 mt-8">
              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <Clock className="w-5 h-5 mt-1" />
                <div className="text-left">
                  <h3 className="font-medium">Estimated Review Time</h3>
                  <p className="text-sm text-muted-foreground">1-2 business days</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <Mail className="w-5 h-5 mt-1" />
                <div className="text-left">
                  <h3 className="font-medium">Next Steps</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email notification once your application is approved
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <FileCheck className="w-5 h-5 mt-1" />
                <div className="text-left">
                  <h3 className="font-medium">Document Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team will verify all submitted documents and may contact you if additional information is needed
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg mt-4">
              <AlertCircle className="w-5 h-5" />
              <span>
                Need help? <Link href="/contact" className="underline">Contact our support team</Link>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}