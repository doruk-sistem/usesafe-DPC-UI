"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { CompanyInfoStep } from "./steps/company-info";
import { DocumentsStep } from "./steps/documents";
import { ContactInfoStep } from "./steps/contact-info";
import { formSchema } from "@/lib/schemas/manufacturer";
import { Progress } from "@/components/ui/progress";
import type { z } from "zod";

type FormData = z.infer<typeof formSchema>;

const steps = [
  { title: "Company Information", component: CompanyInfoStep },
  { title: "Documents", component: DocumentsStep },
  { title: "Contact Details", component: ContactInfoStep },
];

export function ManufacturerRegistrationForm() {
  const [step, setStep] = useState(0);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      registrationNumber: "",
      address: "",
      country: "",
      documents: [],
      contactName: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // TODO: Implement API call to register manufacturer
      console.log(data);
      toast({
        title: "Registration Successful",
        description: "Your registration has been submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your registration.",
        variant: "destructive",
      });
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

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
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button type="button" onClick={nextStep} className="ml-auto">
                Next
              </Button>
            ) : (
              <Button type="submit" className="ml-auto">
                Submit Registration
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}