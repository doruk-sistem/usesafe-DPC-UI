"use client";

import { Factory } from "lucide-react";

import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <Factory className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Company Registration</h1>
        <p className="text-muted-foreground max-w-2xl">
          Join UseSafe&apos;s digital certification platform to verify and showcase your company&apos;s products and materials.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Registration</CardTitle>
          <CardDescription>
            Please fill in your company details to begin the certification process. All fields marked with (*) are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}