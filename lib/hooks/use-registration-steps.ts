"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface StepValidation {
  fields: string[];
  isValid: (form: UseFormReturn<any>) => Promise<boolean>;
}

const stepValidations: StepValidation[] = [
  {
    fields: ["companyName", "taxId"],
    isValid: async (form) => {
      try {
        console.log('Validating company info step');
        console.log('Form values:', form.getValues());
        const result = await form.trigger(["companyName", "taxId"]);
        console.log('Company info validation result:', result);
        return result;
      } catch (error) {
        console.error("Company info validation error:", error);
        return false;
      }
    },
  },
  {
    fields: ["ownerName", "nationalId", "email", "phone"],
    isValid: async (form) => {
      try {
        console.log('Validating owner info step');
        console.log('Form values:', form.getValues());
        const values = form.getValues();
        
        // Sadece dolu alanları kontrol et
        const fieldsToValidate = [];
        if (values.ownerName) fieldsToValidate.push("ownerName");
        if (values.nationalId) fieldsToValidate.push("nationalId");
        if (values.email) fieldsToValidate.push("email");
        if (values.phone) fieldsToValidate.push("phone");
        
        if (fieldsToValidate.length === 0) {
          console.log('No fields to validate');
          return false;
        }
        
        const result = await form.trigger(fieldsToValidate);
        console.log('Owner info validation result:', result);
        return result;
      } catch (error) {
        console.error("Owner info validation error:", error);
        return false;
      }
    },
  },
  {
    fields: ["address", "city", "district"],
    isValid: async (form) => {
      try {
        console.log('Validating address step');
        console.log('Form values:', form.getValues());
        const result = await form.trigger(["address", "city", "district"]);
        console.log('Address validation result:', result);
        return result;
      } catch (error) {
        console.error("Address validation error:", error);
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
        console.log('Validating documents step');
        console.log('Form values:', form.getValues());
        const result = await form.trigger([
          "signatureCircular",
          "tradeRegistry",
          "taxPlate",
          "activityCertificate",
        ]);
        console.log('Documents validation result:', result);
        return result;
      } catch (error) {
        console.error("Documents validation error:", error);
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
      console.log('Starting nextStep validation');
      console.log('Current step:', currentStep);
      const currentValidation = stepValidations[currentStep];
      console.log('Validation fields:', currentValidation.fields);
      
      const isValid = await currentValidation.isValid(form);
      console.log('Step validation result:', isValid);

      if (isValid) {
        console.log('Validation successful, moving to next step');
        setCurrentStep((prev) => {
          const next = Math.min(prev + 1, totalSteps - 1);
          console.log('New step will be:', next);
          return next;
        });
        return true;
      }
      console.log('Validation failed, staying on current step');
      return false;
    } catch (error) {
      console.error("Step validation error:", error);
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
