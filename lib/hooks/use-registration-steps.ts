"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { registerSchema } from "@/lib/schemas/auth";

type FormData = z.infer<typeof registerSchema>;

const STEPS = [
  {
    title: "Company Information",
    fields: ["companyName", "taxId", "tradeRegisterNumber", "mersisNumber"],
  },
  {
    title: "Owner Information",
    fields: ["nationalId", "countryCode", "phone"],
  },
  {
    title: "Address",
    fields: ["address", "city", "district", "postalCode"],
  },
  {
    title: "Documents",
    fields: ["password", "confirmPassword"],
  },
];

export function useRegistrationSteps(form: UseFormReturn<FormData>) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = STEPS.length;

  const validateStep = async (step: number) => {
    try {
      const currentStepValues = form.getValues();
      const currentStepErrors: Record<string, any> = {};
      
      for (const field of STEPS[step].fields) {
        const value = currentStepValues[field];
        const fieldError = await form.trigger(field as any);
        if (!fieldError) {
          currentStepErrors[field] = form.formState.errors[field];
        }
      }

      return Object.keys(currentStepErrors).length === 0;
    } catch (error) {
      return false;
    }
  };

  const nextStep = async () => {
    try {
      const isValid = await validateStep(currentStep);

      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    isLastStep,
    progress,
  };
}
