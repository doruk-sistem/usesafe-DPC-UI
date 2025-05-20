import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import React from "react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRegistrationSteps } from "@/lib/hooks/use-registration-steps";
import { useToast } from "@/lib/hooks/use-toast";
import { registerSchema } from "@/lib/schemas/auth";
import { ManufacturerService } from "@/lib/services/manufacturer";
import { CompanyDocumentService } from "@/lib/services/companyDocument";
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

export function ComplateRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { updateUser } = useAuth();
  const { toast } = useToast();

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
      signatureCircular: null,
      tradeRegistry: null,
      taxPlate: null,
      activityCertificate: null,
    },
    mode: "onChange",
  });

  const { currentStep, totalSteps, nextStep, prevStep, isLastStep, progress } =
    useRegistrationSteps(form);

  const onSubmit = async (data: FormData) => {
    console.log('onSubmit function called');
    console.log('Form data:', data);
    console.log('Form errors:', form.formState.errors);
    console.log('Current step:', currentStep);
    console.log('Is last step:', isLastStep);

    if (isLastStep) {
      setIsSubmitting(true);
      try {
        // Önce şirket kaydını yap
        const registrationData = prepareRegistrationData(data);
        console.log('Prepared registration data:', registrationData);
        const response = await ManufacturerService.register(registrationData);
        console.log('Registration response:', response);

        if (response.success) {
          // Şirket kaydı başarılı olduktan sonra dökümanları yükle
          const documents = [
            { file: data.signatureCircular, type: 'signature_circular' },
            { file: data.tradeRegistry, type: 'trade_registry_gazette' },
            { file: data.taxPlate, type: 'tax_plate' },
            { file: data.activityCertificate, type: 'activity_certificate' }
          ].filter(doc => doc.file && doc.file.file);

          console.log('Documents to upload:', documents);

          for (const doc of documents) {
            if (doc.file && doc.file.file) {
              try {
                await CompanyDocumentService.uploadDocument(
                  doc.file.file,
                  response.registrationId,
                  doc.type
                );
              } catch (error) {
                console.error(`Error uploading document ${doc.type}:`, error);
                // Döküman yükleme hatası olsa bile devam et
                toast({
                  title: "Uyarı",
                  description: `${doc.type} dökümanı yüklenirken hata oluştu. Daha sonra tekrar yükleyebilirsiniz.`,
                  variant: "destructive",
                });
              }
            }
          }

          // Kullanıcı bilgilerini güncelle
          await updateUser({
            data: {
              company_id: response.registrationId,
            },
          });

          setIsSubmitted(true);
          toast({
            title: "Başarılı",
            description: "Kayıt işlemi tamamlandı.",
          });
        }
      } catch (error) {
        console.error("Registration error:", error);
        toast({
          title: "Hata",
          description: error instanceof Error ? error.message : "Kayıt sırasında bir hata oluştu",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('Attempting to move to next step...');
      const isValid = await nextStep();
      console.log('Step validation result:', isValid);
      if (!isValid) {
        console.log('Form validation failed');
        const errors = form.formState.errors;
        console.log('Validation errors:', errors);
        
        // İlk hatayı göster
        const firstError = Object.values(errors)[0];
        if (firstError) {
          toast({
            title: "Hata",
            description: firstError.message || "Lütfen tüm zorunlu alanları doldurun",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Hata",
            description: "Lütfen tüm zorunlu alanları doldurun",
            variant: "destructive",
          });
        }
      }
    }
  };

  if (isSubmitted) {
    return <RegistrationSuccess />;
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="space-y-6">
      <Progress value={progress} className="h-2" />
      <Form {...form}>
        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            console.log('Form submit event triggered');
            console.log('Form state before submit:', {
              values: form.getValues(),
              errors: form.formState.errors,
              isDirty: form.formState.isDirty,
              isValid: form.formState.isValid
            });

            // Form değerlerini al
            const values = form.getValues();
            console.log('Current form values:', values);

            // Sadece mevcut adımın validasyonunu yap
            const currentStepFields = steps[currentStep].fields || [];
            const isValid = await form.trigger(currentStepFields);
            console.log('Form validation result:', isValid);

            if (isValid) {
              onSubmit(values);
            } else {
              console.log('Form validation failed');
              const errors = form.formState.errors;
              console.log('Validation errors:', errors);
              
              // İlk hatayı göster
              const firstError = Object.values(errors)[0];
              if (firstError) {
                toast({
                  title: "Hata",
                  description: firstError.message || "Lütfen tüm zorunlu alanları doldurun",
                  variant: "destructive",
                });
              } else {
                toast({
                  title: "Hata",
                  description: "Lütfen tüm zorunlu alanları doldurun",
                  variant: "destructive",
                });
              }
            }
          }} 
          className="space-y-8"
        >
          <CurrentStepComponent form={form} />
          <div className="flex justify-between">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Geri
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              onClick={() => {
                console.log('Submit button clicked');
                console.log('Current form values:', form.getValues());
              }}
            >
              {isSubmitting
                ? "Kaydediliyor..."
                : isLastStep
                ? "Kaydet"
                : "İleri"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
