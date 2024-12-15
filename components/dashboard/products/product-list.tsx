"use client";

import { motion } from "framer-motion";
import { Battery, MoreHorizontal, FileText, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Product } from "@/lib/types/product";

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductList({ products, isLoading }: ProductListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Loading your products...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Battery className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
          <p className="text-muted-foreground mb-4">Start by adding your first product.</p>
          <Button asChild>
            <Link href="/dashboard/products/new">Add Product</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          Manage your product catalog
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
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="rounded-md object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.model} · {product.serial_number}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {product.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <p>
                      {product.voltage} · {product.capacity}
                    </p>
                    <p className="text-muted-foreground">{product.dimensions}</p>
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
                      product.dpc_status === "approved"
                        ? "success"
                        : product.dpc_status === "pending"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {product.dpc_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {product.certifications?.map((cert, index) => (
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
                      {product.dpc_status !== "approved" && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${product.id}/dpc/new`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Submit DPC
                          </Link>
                        </DropdownMenuItem>
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