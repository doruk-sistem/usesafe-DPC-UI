"use client";

import {
  Eye,
  MoreHorizontal,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  History,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const documents = [
  {
    id: "DOC-001",
    name: "ISO 9001:2015 Certificate",
    type: "Certification",
    manufacturer: "TechFabrics Ltd",
    manufacturerId: "MFR-001",
    status: "pending",
    validUntil: "2025-03-15",
    uploadedAt: "2024-03-15T10:30:00",
    fileSize: "2.4 MB",
    version: "1.0",
  },
  {
    id: "DOC-002",
    name: "Environmental Compliance Report",
    type: "Compliance",
    manufacturer: "EcoTextiles Co",
    manufacturerId: "MFR-002",
    status: "approved",
    validUntil: "2024-12-31",
    uploadedAt: "2024-03-14T15:45:00",
    fileSize: "1.8 MB",
    version: "2.1",
  },
  {
    id: "DOC-003",
    name: "Quality Control Certificate",
    type: "Quality",
    manufacturer: "Sustainable Wear",
    manufacturerId: "MFR-003",
    status: "rejected",
    validUntil: "2024-09-30",
    uploadedAt: "2024-03-13T09:15:00",
    fileSize: "3.2 MB",
    version: "1.0",
  },
  {
    id: "DOC-004",
    name: "Manufacturing License",
    type: "Legal",
    manufacturer: "TechFabrics Ltd",
    manufacturerId: "MFR-001",
    status: "expired",
    validUntil: "2024-02-28",
    uploadedAt: "2023-03-01T11:20:00",
    fileSize: "1.5 MB",
    version: "1.0",
  },
];

export function DocumentList() {
  const t = useTranslations("documentManagement");
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const manufacturerId = searchParams.get("manufacturer");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDocuments = documents
    .filter((doc) =>
      manufacturerId ? doc.manufacturerId === manufacturerId : true
    )
    .filter((doc) =>
      statusFilter === "all" ? true : doc.status === statusFilter
    );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleApprove = async (docId: string) => {
    try {
      // TODO: API çağrısı eklenecek
      toast({
        title: t("toast.approved.title"),
        description: t("toast.approved.description"),
      });
    } catch (error) {
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.approveDescription"),
        variant: "destructive",
      });
    }
  };

  const handleReject = async (docId: string) => {
    try {
      // TODO: API çağrısı eklenecek
      toast({
        title: t("toast.rejected.title"),
        description: t("toast.rejected.description"),
      });
    } catch (error) {
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.rejectDescription"),
        variant: "destructive",
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "expired":
        return "destructive";
      default:
        return "warning";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("repository.title")}</CardTitle>
            <CardDescription>
              {t("repository.description")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filters.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allDocuments")}</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="approved">{t("status.approved")}</SelectItem>
                <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
                <SelectItem value="expired">{t("status.expiringSoon")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("repository.columns.document")}</TableHead>
              <TableHead>{t("repository.columns.type")}</TableHead>
              <TableHead>{t("repository.columns.category")}</TableHead>
              <TableHead>{t("repository.columns.status")}</TableHead>
              <TableHead>{t("repository.columns.expiryDate")}</TableHead>
              <TableHead>{t("repository.columns.updatedBy")}</TableHead>
              <TableHead>{t("repository.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.id} · {doc.fileSize}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.manufacturer}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(doc.status)}
                    className="flex w-fit items-center gap-1"
                  >
                    {getStatusIcon(doc.status)}
                    {t(`status.${doc.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(doc.validUntil).toLocaleDateString()}
                </TableCell>
                <TableCell>v{doc.version}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("repository.actions.title")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/documents/${doc.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t("repository.actions.viewDetails")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        {t("repository.actions.download")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <History className="mr-2 h-4 w-4" />
                        {t("repository.actions.viewHistory")}
                      </DropdownMenuItem>
                      {doc.status === "pending" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleApprove(doc.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {t("repository.actions.approve")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReject(doc.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            {t("repository.actions.reject")}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
