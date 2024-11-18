"use client";

import { Eye, MoreHorizontal, Box, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const certifications = [
  {
    id: "DPC-001",
    productName: "Organic Cotton T-Shirt",
    manufacturer: "TechFabrics Ltd",
    manufacturerId: "MFR-001",
    category: "Textile",
    status: "pending",
    submittedAt: "2024-03-15T10:30:00",
    sustainabilityScore: 85,
    testReports: 3,
    certificates: 2,
  },
  {
    id: "DPC-002",
    productName: "Recycled Denim Jeans",
    manufacturer: "EcoTextiles Co",
    manufacturerId: "MFR-002",
    category: "Textile",
    status: "approved",
    submittedAt: "2024-03-14T15:45:00",
    sustainabilityScore: 92,
    testReports: 4,
    certificates: 3,
  },
  {
    id: "DPC-003",
    productName: "Bamboo Fiber Shirt",
    manufacturer: "Sustainable Wear",
    manufacturerId: "MFR-003",
    category: "Textile",
    status: "rejected",
    submittedAt: "2024-03-13T09:15:00",
    sustainabilityScore: 78,
    testReports: 2,
    certificates: 1,
  },
];

export function CertificationList() {
  const searchParams = useSearchParams();
  const manufacturerId = searchParams.get('manufacturer');

  const filteredCertifications = manufacturerId
    ? certifications.filter(cert => cert.manufacturerId === manufacturerId)
    : certifications;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "warning";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DPC Applications</CardTitle>
        <CardDescription>
          Review and manage product certification requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCertifications.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{cert.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {cert.id} · {new Date(cert.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{cert.category}</TableCell>
                <TableCell>{cert.manufacturer}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(cert.status)}
                    className="flex w-fit items-center gap-1"
                  >
                    {getStatusIcon(cert.status)}
                    {cert.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={cert.sustainabilityScore >= 80 ? "success" : "warning"}>
                    {cert.sustainabilityScore}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {cert.testReports} Reports · {cert.certificates} Certificates
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/certifications/${cert.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Review Documents</DropdownMenuItem>
                      <DropdownMenuItem>View Test Reports</DropdownMenuItem>
                      {cert.status === "pending" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-green-600">
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Reject
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