"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { CompanyInfoStep } from "./steps/company-info";
import { OwnerInfoStep } from "./steps/owner-info";
import { AddressStep } from "./steps/address";
import { DocumentsStep } from "./steps/documents";
import { RegistrationSuccess } from "./steps/registration-success";
import { registerSchema } from "@/lib/schemas/auth";
import { Progress } from "@/components/ui/progress";
import type { z } from "zod";

type FormData = z.infer<typeof registerSchema>;

const steps = [
  { title: "Company Information", component: CompanyInfoStep },
  { title: "Owner Information", component: OwnerInfoStep },
  { title: "Address", component: AddressStep },
  { title: "Documents", component: DocumentsStep },
];

export function RegisterForm() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: "",
      taxId: "",
      tradeRegisterNumber: "",
      mersisNumber: "",
      ownerName: "",
      nationalId: "",
      email: "",
      countryCode: "+90",
      phone: "",
      address: "",
      city: "",
      district: "",
      postalCode: "",
      isoCertificates: [],
      qualityCertificates: [],
      exportDocuments: [],
      productionPermits: [],
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      // TODO: Implement API call
      console.log(data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitted(true);
      toast({
        title: "Registration Submitted Successfully",
        description: "Please check your email to verify your account.",
      });

      // Simulate email verification and redirect
      setTimeout(() => {
        router.push("/auth/pending-approval");
      }, 5000);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fields = Object.keys(form.getValues());
    const currentStepFields = fields.filter(field => {
      if (step === 0) return ["companyName", "taxId", "tradeRegisterNumber", "mersisNumber"].includes(field);
      if (step === 1) return ["ownerName", "nationalId", "email", "countryCode", "phone", "password", "confirmPassword"].includes(field);
      if (step === 2) return ["address", "city", "district", "postalCode"].includes(field);
      return ["documents"].includes(field);
    });

    const isValid = await form.trigger(currentStepFields);
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  if (isSubmitted) {
    return <RegistrationSuccess />;
  }

  const progress = ((step + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[step].component;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {step + 1} of {steps.length}</span>
          <span>{steps[step].title}</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CurrentStepComponent form={form} />

          <div className="flex justify-between pt-4">
            {step > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button 
                type="button" 
                onClick={nextStep} 
                className="ml-auto"
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="ml-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}