"use client";

import { Factory, MoreHorizontal, FileText, ExternalLink, Box } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { CompanyService } from "@/lib/services/company";
import type { Company } from "@/lib/types/company";

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { company } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!company?.id) return;

      try {
        setIsLoading(true);
        const data = await CompanyService.getSuppliers(company.id);
        setSuppliers(data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        toast({
          title: "Error",
          description: "Failed to load suppliers",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, [company?.id, toast]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground">Loading suppliers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suppliers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Factory className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Suppliers Found</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-sm">
            You don't have any suppliers yet. They will appear here when you add products from manufacturers or material suppliers.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier List</CardTitle>
        <CardDescription>
          View and manage your company's suppliers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Tax ID</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Factory className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {supplier.companyType}
                  </Badge>
                </TableCell>
                <TableCell>{supplier.taxInfo.taxNumber}</TableCell>
                <TableCell>
                  <Link href={`/dashboard/products?manufacturer=${supplier.id}`}>
                    <Button variant="ghost" size="sm">
                      View Products
                    </Button>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
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
                        <Link href={`/dashboard/products?manufacturer=${supplier.id}`}>
                          <Box className="h-4 w-4 mr-2" />
                          View Products
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/documents?manufacturer=${supplier.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Documents
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/certifications?manufacturer=${supplier.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Certifications
                        </Link>
                      </DropdownMenuItem>
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