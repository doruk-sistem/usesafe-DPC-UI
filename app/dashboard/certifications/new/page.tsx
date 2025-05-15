"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewDPCForm } from "../../../../components/dashboard/certifications/new-dpc-form";

export default function NewDPCPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Yeni DPC Başvurusu</h1>
        <p className="text-sm text-muted-foreground">
          Yeni bir Dijital Ürün Sertifikası başvurusu oluşturun
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>DPC Başvuru Formu</CardTitle>
          <CardDescription>
            Lütfen başvuru için gerekli bilgileri doldurun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewDPCForm />
        </CardContent>
      </Card>
    </div>
  );
}
