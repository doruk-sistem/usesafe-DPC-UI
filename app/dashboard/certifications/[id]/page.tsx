import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye } from "lucide-react";
import Link from "next/link";

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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "expired":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default async function CertificationDetailPage({ params }: Props) {
  const certification = await getCertification(params.id);

  if (!certification) {
    notFound();
  }

  const { data: { publicUrl } } = supabase.storage
    .from("company-documents")
    .getPublicUrl(certification.filePath);

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/certifications">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Sertifika Detayı</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{certification.type}</span>
            <Badge className={`${getStatusColor(certification.status)} text-white`}>
              {certification.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sertifika Tipi</p>
              <p className="font-medium">{certification.type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Durum</p>
              <p className="font-medium">{certification.status}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Oluşturulma Tarihi</p>
              <p className="font-medium">
                {new Date(certification.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Son Güncelleme</p>
              <p className="font-medium">
                {new Date(certification.updatedAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button asChild className="flex-1">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Görüntüle
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <a href={publicUrl} download className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                İndir
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
