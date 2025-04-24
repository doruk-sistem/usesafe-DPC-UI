"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRegistrationSteps } from "@/lib/hooks/use-registration-steps";
import { useToast } from "@/lib/hooks/use-toast";
import { registerSchema } from "@/lib/schemas/auth";
import { ManufacturerService } from "@/lib/services/manufacturer";
import { prepareRegistrationData } from "@/lib/utils/registration-mapper";

import { AddressStep } from "./steps/address";
import { CompanyInfoStep } from "./steps/company-info";
import { DocumentsStep } from "./steps/documents";
import { OwnerInfoStep } from "./steps/owner-info";
import { RegistrationSuccess } from "./steps/registration-success";
import { Card } from "@/components/ui/card";

type FormData = z.infer<typeof registerSchema>;

const steps = [
  { title: "Company Information", component: CompanyInfoStep },
  { title: "Owner Information", component: OwnerInfoStep },
  { title: "Address", component: AddressStep },
  { title: "Documents", component: DocumentsStep },
];

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("auth.createAccount");

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

  const { currentStep, totalSteps, nextStep, prevStep, isLastStep, progress } =
    useRegistrationSteps(form);

  const onNextStep = async () => {
    try {
      // Always try to progress to the next step
      const stepValidated = await nextStep();

      // If this is the last step and validation passes, submit the full registration
      if (isLastStep && stepValidated) {
        setIsSubmitting(true);

        try {
          const formData = form.getValues();

          // Prepare and submit manufacturer data
          const registrationData = prepareRegistrationData(formData);
          const response = await ManufacturerService.register(registrationData);

          if (!response.success) {
            throw new Error(response.message || t("error.description"));
          }

          setIsSubmitted(true);
          toast({
            title: t("success.title"),
            description: t("success.description"),
          });

        } catch (error) {
          toast({
            title: t("error.title"),
            description: error instanceof Error ? error.message : t("error.description"),
            variant: "destructive",
          });
          throw error;
        }
      }
    } catch (error) {
      toast({
        title: t("error.title"),
        description: error instanceof Error ? error.message : t("error.description"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onNextStep();
    }
  };

  if (isSubmitted) {
    return <RegistrationSuccess />;
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="space-y-8">
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {t("step")} {currentStep + 1} {t("of")} {totalSteps}
              </span>
              <span>{t(`steps.${steps[currentStep].title}`)}</span>
            </div>
          </div>

          <Form {...form}>
            <form
              className="space-y-8"
              onKeyDown={handleKeyPress}
            >
              <CurrentStepComponent form={form} />

              <div className="flex justify-between pt-4">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting}
                  >
                    {t("buttons.previous")}
                  </Button>
                )}
                <Button
                  type="button"
                  className="ml-auto"
                  disabled={isSubmitting}
                  onClick={() => onNextStep()}
                >
                  {isSubmitting
                    ? t("buttons.submitting")
                    : isLastStep
                    ? t("buttons.submit")
                    : t("buttons.next")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
