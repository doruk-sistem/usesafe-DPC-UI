"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface StepValidation {
  fields: string[];
  isValid: (form: UseFormReturn<any>) => Promise<boolean>;
}

const stepValidations: StepValidation[] = [
  {
    fields: ["companyName", "taxId", "tradeRegisterNumber", "mersisNumber"],
    isValid: async (form) => {
      const result = await form.trigger(["companyName", "taxId"]);
      return result;
    },
  },
  {
    fields: ["nationalId", "countryCode", "phone"],
    isValid: async (form) => {
      const result = await form.trigger(["nationalId", "phone"]);
      return result;
    },
  },
  {
    fields: ["address", "city", "district"],
    isValid: async (form) => {
      const result = await form.trigger(["address", "city", "district"]);
      return result;
    },
  },
  {
    fields: [
      "signatureCircular",
      "tradeRegistry",
      "taxPlate",
      "activityCertificate",
    ],
    isValid: async (form) => {
      const result = await form.trigger([
        "signatureCircular",
        "tradeRegistry",
        "taxPlate",
        "activityCertificate",
      ]);
      return result;
    },
  },
];

export const useRegistrationSteps = (form: UseFormReturn<any>) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = stepValidations.length;

  const nextStep = async () => {
    const currentValidation = stepValidations[currentStep];
    const isValid = await currentValidation.isValid(form);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      return true;
    }
    return false;
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
};
