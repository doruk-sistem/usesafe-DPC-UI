"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewDPCForm } from "../../../../components/dashboard/certifications/new-dpc-form";

export default function NewDPCPage() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Dijital Ürün Sertifikası Başvuru Formu</CardTitle>
          <CardDescription>
            Lütfen sertifika başvurusu için gerekli bilgileri doldurun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewDPCForm />
        </CardContent>
      </Card>
    </div>
  );
}
