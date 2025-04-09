"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Plus, File, CheckCircle, XCircle, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CompanyDocumentsProps {
  companyId: string;
}

// Örnek belge verileri
const documentData = {
  "CMP-001": [
    {
      id: "DOC-001",
      name: "Ticaret Sicil Gazetesi",
      type: "trade_registry_gazette",
      status: "approved",
      uploadedAt: "2024-05-10T10:30:00",
      approvedAt: "2024-05-11T14:20:00",
      fileUrl: "#",
    },
    {
      id: "DOC-002",
      name: "Vergi Levhası",
      type: "tax_plate",
      status: "approved",
      uploadedAt: "2024-05-10T10:32:00",
      approvedAt: "2024-05-11T14:25:00",
      fileUrl: "#",
    },
    {
      id: "DOC-003",
      name: "Faaliyet Belgesi",
      type: "activity_certificate",
      status: "pending",
      uploadedAt: "2024-05-12T09:15:00",
      approvedAt: null,
      fileUrl: "#",
    },
    {
      id: "DOC-004",
      name: "ISO 9001 Sertifikası",
      type: "iso_certificate",
      status: "rejected",
      uploadedAt: "2024-05-08T11:20:00",
      approvedAt: null,
      rejectionReason: "Belge süresi dolmuş. Güncel belge yükleyin.",
      fileUrl: "#",
    },
  ],
  "CMP-002": [
    {
      id: "DOC-005",
      name: "Ticaret Sicil Gazetesi",
      type: "trade_registry_gazette",
      status: "approved",
      uploadedAt: "2024-05-05T15:10:00",
      approvedAt: "2024-05-06T09:30:00",
      fileUrl: "#",
    },
    {
      id: "DOC-006",
      name: "Vergi Levhası",
      type: "tax_plate",
      status: "approved",
      uploadedAt: "2024-05-05T15:12:00",
      approvedAt: "2024-05-06T09:35:00",
      fileUrl: "#",
    },
  ],
  "CMP-003": [
    {
      id: "DOC-007",
      name: "Ticaret Sicil Gazetesi",
      type: "trade_registry_gazette",
      status: "pending",
      uploadedAt: "2024-05-06T10:25:00",
      approvedAt: null,
      fileUrl: "#",
    },
    {
      id: "DOC-008",
      name: "Vergi Levhası",
      type: "tax_plate",
      status: "pending",
      uploadedAt: "2024-05-06T10:28:00",
      approvedAt: null,
      fileUrl: "#",
    },
    {
      id: "DOC-009",
      name: "İmza Sirküleri",
      type: "signature_circular",
      status: "pending",
      uploadedAt: "2024-05-06T10:30:00",
      approvedAt: null,
      fileUrl: "#",
    },
  ],
};

// Doküman tiplerinin Türkçe karşılıkları
const documentTypeLabels = {
  signature_circular: "İmza Sirküleri",
  trade_registry_gazette: "Ticaret Sicil Gazetesi",
  tax_plate: "Vergi Levhası",
  activity_certificate: "Faaliyet Belgesi",
  iso_certificate: "ISO Sertifikası",
  quality_certificate: "Kalite Sertifikası",
  export_certificate: "İhracat Belgesi",
  production_permit: "Üretim İzni",
};

export function CompanyDocuments({ companyId }: CompanyDocumentsProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Burada normalde API çağrısı olacak
    const fetchDocuments = async () => {
      try {
        // API çağrısı simülasyonu
        await new Promise((resolve) => setTimeout(resolve, 500));
        // @ts-ignore
        const data = documentData[companyId] || [];
        setDocuments(data);
      } catch (error) {
        console.error("Belge verileri alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [companyId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Belgeler</CardTitle>
          <CardDescription>Şirkete ait belgelerin listesi</CardDescription>
        </div>
        <Button size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Belge Ekle
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Yükleniyor...</div>
        ) : documents.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Bu şirkete ait belge bulunmamaktadır.
              </p>
              <Button variant="outline" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                İlk Belgeyi Yükle
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Belge ID</TableHead>
                <TableHead>Belge Adı</TableHead>
                <TableHead>Belge Türü</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Yüklenme Tarihi</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">{document.id}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    {document.name}
                  </TableCell>
                  <TableCell>
                    {documentTypeLabels[document.type] || document.type}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        document.status === "approved"
                          ? "success"
                          : document.status === "rejected"
                          ? "destructive"
                          : "warning"
                      }
                      className="flex w-fit items-center gap-1"
                    >
                      {document.status === "approved" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : document.status === "rejected" ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {document.status === "approved"
                        ? "Onaylandı"
                        : document.status === "rejected"
                        ? "Reddedildi"
                        : "Onay Bekliyor"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">İşlemler</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Görüntüle</DropdownMenuItem>
                        <DropdownMenuItem>İndir</DropdownMenuItem>
                        {document.status === "pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-green-600">
                              Onayla
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Reddet
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}