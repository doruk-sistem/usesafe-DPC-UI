"use client";

import { CheckCircle2, Mail } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function RegistrationSuccess() {
  return (
    <Card className="border-2 border-green-500">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
          <h2 className="text-2xl font-semibold">Registration Submitted Successfully</h2>
          
          <div className="space-y-2 text-muted-foreground">
            <p>Thank you for registering with UseSafe.</p>
            <p>We&apos;ve sent a verification email to your registered email address.</p>
          </div>

          <div className="flex items-center gap-2 text-sm bg-muted p-4 rounded-lg mt-4">
            <Mail className="w-5 h-5" />
            <span>Please check your email to verify your account</span>
          </div>

          <div className="text-sm text-muted-foreground mt-6">
            <p>Next steps:</p>
            <ol className="list-decimal list-inside text-left mt-2 space-y-2">
              <li>Verify your email address</li>
              <li>Wait for admin review (typically 1-2 business days)</li>
              <li>Receive approval notification</li>
              <li>Complete platform onboarding</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}