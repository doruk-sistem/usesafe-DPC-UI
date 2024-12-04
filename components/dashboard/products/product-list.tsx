"use client";

import { Battery, MoreHorizontal, FileText, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { products } from "@/lib/data/products";

export function ProductList() {
  // Helper function to determine product status and DPC status
  const getProductStatus = (product: any) => {
    // You can implement more complex logic here based on your requirements
    const status = product.basicInfo.manufacturingDate > new Date().toISOString() 
      ? "draft" 
      : "active";
    
    // Randomly assign DPC status for demonstration
    const dpcStatus = Math.random() > 0.5 
      ? "approved" 
      : Math.random() > 0.5 
        ? "pending" 
        : "not_submitted";

    return { status, dpcStatus };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Battery Products</CardTitle>
        <CardDescription>
          Manage your battery products and their certifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Specifications</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>DPC Status</TableHead>
              <TableHead>Certifications</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const { status, dpcStatus } = getProductStatus(product);
              
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.basicInfo.model} · {product.basicInfo.serialNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {product.technicalSpecs.find(spec => spec.name === "Battery Type")?.value || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <p>
                        {product.technicalSpecs.find(spec => spec.name === "Voltage")?.value} · 
                        {product.technicalSpecs.find(spec => spec.name === "Capacity")?.value}
                      </p>
                      <p className="text-muted-foreground">{product.basicInfo.dimensions}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        status === "active"
                          ? "success"
                          : status === "draft"
                          ? "secondary"
                          : "warning"
                      }
                    >
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        dpcStatus === "approved"
                          ? "success"
                          : dpcStatus === "pending"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {dpcStatus === "not_submitted" ? "Not Submitted" : dpcStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {product.certifications
                        .filter(cert => cert.status === "valid")
                        .map((cert, index) => (
                          <Badge key={index} variant="outline">
                            {cert.name}
                          </Badge>
                        ))
                      }
                    </div>
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
                          <Link href={`/products/${product.id}`}>
                            <Battery className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${product.id}/edit`}>
                            Edit Product
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${product.id}/documents`}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Documents
                          </Link>
                        </DropdownMenuItem>
                        {dpcStatus !== "approved" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}/dpc/new`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Submit DPC
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}