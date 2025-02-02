"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function LoginContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm from={from} />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <ShieldCheck className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">
          Sign in to manage your digital product certifications
        </p>
      </div>

      <Suspense fallback={
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}