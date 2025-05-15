import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  params: {
    id: string;
  };
}

async function getCertification(id: string) {
  const { data: certification, error } = await supabase
    .from("company_documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !certification) {
    return null;
  }

  return certification;
}

export default async function CertificationDetailPage({ params }: Props) {
  const certification = await getCertification(params.id);

  if (!certification) {
    notFound();
  }

  // Public URL oluştur
  const { data: { publicUrl } } = supabase.storage
    .from("company-documents")
    .getPublicUrl(certification.filePath);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sertifika Detayı</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Tip:</strong> {certification.type}
          </div>
          <div>
            <strong>Durum:</strong> {certification.status}
          </div>
          <div>
            <strong>Oluşturulma Tarihi:</strong>{" "}
            {new Date(certification.createdAt).toLocaleDateString("tr-TR")}
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                Görüntüle
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={publicUrl} download>
                İndir
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
