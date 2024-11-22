"use client";

import { Battery, MoreHorizontal, FileText, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

// Sample data - In a real app, this would come from an API
const products = [
  {
    id: "BAT-001",
    name: "AGM LEO Advanced Battery",
    type: "AGM",
    model: "AGM-LEO-12V-65AH",
    serialNumber: "86901451725441",
    status: "active",
    dpcStatus: "approved",
    specs: {
      voltage: "12V",
      capacity: "65 Ah",
      weight: "17.5 kg",
      dimensions: "242x175x190mm",
    },
    certifications: ["CE", "ISO 9001", "TSE"],
    image: "/images/agm-leo-battery.png",
  },
  {
    id: "BAT-002",
    name: "EFB MAX TIGRIS Battery",
    type: "EFB",
    model: "EFB-TIGRIS-12V-145AH",
    serialNumber: "8690145155004",
    status: "active",
    dpcStatus: "pending",
    specs: {
      voltage: "12V",
      capacity: "145 Ah",
      weight: "38 kg",
      dimensions: "513x189x220mm",
    },
    certifications: ["CE", "ISO 9001"],
    image: "/images/efb-max-battery.png",
  },
  {
    id: "BAT-003",
    name: "MAXIM A GORILLA Battery",
    type: "Standard",
    model: "MAXIM-GORILLA-12V-105AH",
    serialNumber: "8690145165164",
    status: "draft",
    dpcStatus: "not_submitted",
    specs: {
      voltage: "12V",
      capacity: "105 Ah",
      weight: "28 kg",
      dimensions: "242x175x190mm",
    },
    certifications: [],
    image: "/images/maxim-gorilla-battery.png",
  },
];

export function ProductList() {
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
            {products.map((product) => (
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
                        {product.model} · {product.serialNumber}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <p>{product.specs.voltage} · {product.specs.capacity}</p>
                    <p className="text-muted-foreground">{product.specs.dimensions}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.status === "active"
                        ? "success"
                        : product.status === "draft"
                        ? "secondary"
                        : "warning"
                    }
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.dpcStatus === "approved"
                        ? "success"
                        : product.dpcStatus === "pending"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {product.dpcStatus === "not_submitted" ? "Not Submitted" : product.dpcStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {product.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline">
                        {cert}
                      </Badge>
                    ))}
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
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Battery className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          Edit Product
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/products/${product.id}/documents`}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Documents
                        </Link>
                      </DropdownMenuItem>
                      {product.dpcStatus !== "approved" && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${product.id}/dpc/new`}>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}