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
      try {
        const result = await form.trigger(["companyName", "taxId", "tradeRegisterNumber", "mersisNumber"]);
        return result;
      } catch (error) {
        return false;
      }
    },
  },
  {
    fields: ["ownerName", "nationalId", "email", "phone"],
    isValid: async (form) => {
      try {
        const values = form.getValues();
        
        // Sadece dolu alanları kontrol et
        const fieldsToValidate: any[] = [];
        if (values.ownerName) fieldsToValidate.push("ownerName");
        if (values.nationalId) fieldsToValidate.push("nationalId");
        if (values.email) fieldsToValidate.push("email");
        if (values.phone) fieldsToValidate.push("phone");
        
        if (fieldsToValidate.length === 0) {
          return false;
        }
        
        const result = await form.trigger(fieldsToValidate as any);
        return result;
      } catch (error) {
        return false;
      }
    },
  },
  {
    fields: ["address", "city", "district"],
    isValid: async (form) => {
      try {
        const result = await form.trigger(["address", "city", "district"]);
        return result;
      } catch (error) {
        return false;
      }
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
      try {
        const result = await form.trigger([
          "signatureCircular",
          "tradeRegistry",
          "taxPlate",
          "activityCertificate",
        ]);
        return result;
      } catch (error) {
        return false;
      }
    },
  },
];

export const useRegistrationSteps = (form: UseFormReturn<any>) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = stepValidations.length;

  const nextStep = async () => {
    try {
      const currentValidation = stepValidations[currentStep];
      
      const isValid = await currentValidation.isValid(form);

      if (isValid) {
        setCurrentStep((prev) => {
          const next = Math.min(prev + 1, totalSteps - 1);
          return next;
        });
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
};
