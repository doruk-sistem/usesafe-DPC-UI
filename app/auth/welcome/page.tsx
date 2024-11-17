"use client";

import {
  ChevronRight,
  ShieldCheck,
  Box,
  FileText,
  Settings,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const steps = [
  {
    title: "Welcome to UseSafe",
    icon: ShieldCheck,
    description: "Your trusted platform for digital product certification",
    content: (
      <div className="space-y-4">
        <p>
          Welcome to UseSafe! We're excited to have you on board. Our platform helps you:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Certify your products digitally</li>
          <li>Ensure compliance with regulations</li>
          <li>Track sustainability metrics</li>
          <li>Build trust with your customers</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Complete Your Profile",
    icon: Settings,
    description: "Set up your manufacturer profile",
    content: (
      <div className="space-y-4">
        <p>Let's start by completing your manufacturer profile:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Add your company logo</li>
          <li>Update company description</li>
          <li>Set notification preferences</li>
          <li>Configure API access (optional)</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Register Your First Product",
    icon: Box,
    description: "Start certifying your products",
    content: (
      <div className="space-y-4">
        <p>Ready to register your first product?</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Enter product details</li>
          <li>Upload required documentation</li>
          <li>Set sustainability metrics</li>
          <li>Generate Digital Product Passport</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Review Documentation",
    icon: FileText,
    description: "Learn about our platform",
    content: (
      <div className="space-y-4">
        <p>Access our comprehensive documentation:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Platform user guide</li>
          <li>API documentation</li>
          <li>Best practices</li>
          <li>FAQs and troubleshooting</li>
        </ul>
      </div>
    ),
  },
];

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Redirect to dashboard
      window.location.href = "/dashboard";
    }
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <CurrentIcon className="w-12 h-12 text-primary" />
              <h1 className="text-2xl font-semibold">{steps[currentStep].title}</h1>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>

            <div className="bg-muted p-6 rounded-lg">
              {steps[currentStep].content}
            </div>

            <div className="flex justify-between pt-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={nextStep}
                className={currentStep === 0 ? "w-full" : "ml-auto"}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Go to Dashboard
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}