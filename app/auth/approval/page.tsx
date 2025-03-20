"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";

function ApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { verifyOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // URL'den confirmation_url parametresini al
  const confirmationURL = searchParams.get("confirmation_url");
  
  if (!confirmationURL) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            Invalid Verification Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            This link appears to be invalid or incomplete. Please use the original link from your email.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => router.push("/")} 
            variant="outline"
            tabIndex={0}
            aria-label="Return to Home"
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const handleConfirmation = async () => {
    setLoading(true);
    
    try {
      // Security measure: check if verification URL is from Supabase domain
      const url = new URL(decodeURIComponent(confirmationURL));
      
      if (!url.hostname.includes("supabase.co")) {
        toast({
          title: "Security Warning",
          description: "Invalid verification link.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Extract token and type parameters from URL
      const urlParams = new URLSearchParams(url.search);
      const token = urlParams.get('token');
      const type = urlParams.get('type');
      const redirect_to = urlParams.get('redirect_to');
      
      if (token && type) {
        try {
          // Perform token verification with use-auth hook
          await verifyOtp(token, type);
        } catch (error) {
          toast({
            title: "Verification Error",
            description: "An error occurred during email verification.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Show toast after successful verification
        toast({
          title: "Success",
          description: "Your email has been successfully verified.",
          variant: "default"
        });
        
        // Redirect to the redirect_to parameter if it exists, otherwise to the home page
        if (redirect_to) {
          window.location.href = redirect_to;
        } else {
          router.push("/");
        }
      } else {
        // If parameters are not found, redirect directly to the URL
        window.location.href = decodeURIComponent(confirmationURL);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Error",
        description: "An error occurred during the verification process.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
        <CardDescription>
          Verify your email address to activate your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Welcome to the UseSafe platform. You need to verify your email address to activate your account.
        </p>
        
        <Button 
          onClick={handleConfirmation} 
          disabled={loading}
          className="w-full"
          tabIndex={0}
          aria-label="Verify my email"
        >
          {loading ? "Processing..." : "Verify My Email"}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ApprovalPage() {
  return (
    <div className="flex h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <ApprovalContent />
        </Suspense>
      </div>
    </div>
  );
} 