import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

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
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const { currentStep, totalSteps, nextStep, prevStep, isLastStep, progress } =
    useRegistrationSteps(form);

  const onNextStep = async () => {
    try {
      const stepValidated = await nextStep();

      if (isLastStep && stepValidated) {
        setIsSubmitting(true);

        try {
          const formData = form.getValues();
          const registrationData = prepareRegistrationData(formData);
          const response = await ManufacturerService.register(registrationData);

          if (!response.success) {
            throw new Error(response.message || "Registration failed");
          }

          setIsSubmitted(true);
          toast({
            title: "Registration Submitted Successfully",
            description: "Please check your email to verify your account.",
          });
        } catch (error) {
          toast({
            title: "Registration Failed",
            description:
              error instanceof Error
                ? error.message
                : "There was an error submitting your registration. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error submitting your registration. Please try again.",
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
    <div className="space-y-8">
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span>{steps[currentStep].title}</span>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-8"
          onKeyDown={handleKeyPress}
          onSubmit={(e) => {
            e.preventDefault();
            onNextStep();
          }}
        >
          <CurrentStepComponent form={form} />

          <div className="flex justify-between pt-4">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => prevStep()}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            <Button
              type="button"
              className="ml-auto"
              disabled={isSubmitting}
              onClick={onNextStep}
            >
              {isSubmitting
                ? "Submitting..."
                : isLastStep
                ? "Submit Registration"
                : "Next"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
