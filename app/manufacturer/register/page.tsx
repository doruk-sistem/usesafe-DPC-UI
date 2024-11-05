"use client";

import { ManufacturerRegistrationForm } from "@/components/manufacturer/registration-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Factory } from "lucide-react";

export default function ManufacturerRegistration() {
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <Factory className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Manufacturer Registration</h1>
        <p className="text-muted-foreground max-w-2xl">
          Join UseSafe's digital certification platform to verify and showcase your products' authenticity and sustainability.
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Registration Form</CardTitle>
          <CardDescription>
            Please fill in your company details to begin the certification process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManufacturerRegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}