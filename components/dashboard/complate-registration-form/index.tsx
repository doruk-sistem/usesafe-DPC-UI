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
    if (isLastStep) {
      setIsSubmitting(true);
      try {
        // Önce şirket kaydını yap
        const registrationData = prepareRegistrationData(data);
        const response = await ManufacturerService.register(registrationData);

        if (response.success && typeof response.registrationId === 'string') {
          // Şirket kaydı başarılı olduktan sonra dökümanları yükle
          const documents = [
            { file: data.signatureCircular, type: 'signature_circular' },
            { file: data.tradeRegistry, type: 'trade_registry_gazette' },
            { file: data.taxPlate, type: 'tax_plate' },
            { file: data.activityCertificate, type: 'activity_certificate' }
          ].filter(doc => doc.file && doc.file.file);

          for (const doc of documents) {
            if (doc.file && doc.file.file) {
              try {
                await CompanyDocumentService.uploadDocument(
                  doc.file.file,
                  response.registrationId,
                  doc.type as import("@/lib/types/company").DocumentType
                );
              } catch (error) {
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
        toast({
          title: "Hata",
          description: error instanceof Error ? error.message : "Kayıt sırasında bir hata oluştu",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const isValid = await nextStep();
      if (!isValid) {
        const errors = form.formState.errors;
        
        // İlk hatayı göster
        let errorMessage = "Lütfen tüm zorunlu alanları doldurun";
        if (errors[Object.keys(errors)[0]] && typeof errors[Object.keys(errors)[0]] === 'object' && 'message' in errors[Object.keys(errors)[0]] && typeof errors[Object.keys(errors)[0]].message === 'string') {
          errorMessage = errors[Object.keys(errors)[0]].message;
        }
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
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
           
            
            try {
              if (isLastStep) {
                setIsSubmitting(true);
                const values = form.getValues();
                await onSubmit(values);
              } else {
                const isValid = await nextStep();
                if (!isValid) {
                  const errors = form.formState.errors;
                 
                  
                  // İlk hatayı göster
                  let errorMessage = "Lütfen tüm zorunlu alanları doldurun";
                  if (errors[Object.keys(errors)[0]] && typeof errors[Object.keys(errors)[0]] === 'object' && 'message' in errors[Object.keys(errors)[0]] && typeof errors[Object.keys(errors)[0]].message === 'string') {
                    errorMessage = errors[Object.keys(errors)[0]].message;
                  }
                  toast({
                    title: "Hata",
                    description: errorMessage,
                    variant: "destructive",
                  });
                }
              }
            } catch (error) {
              
              toast({
                title: "Hata",
                description: error instanceof Error ? error.message : "Bir hata oluştu",
                variant: "destructive",
              });
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
