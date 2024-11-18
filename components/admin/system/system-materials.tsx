"use client";

import { Box, Plus, MoreHorizontal, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const materials = [
  {
    id: "MAT-001",
    name: "Organic Cotton",
    category: "Natural Fibers",
    type: "Cotton",
    properties: {
      weight: "150 GSM",
      composition: "100% Organic Cotton",
      certification: "GOTS Certified",
    },
    suppliers: 3,
    products: 12,
    status: "active",
  },
  {
    id: "MAT-002",
    name: "Recycled Polyester",
    category: "Synthetic Fibers",
    type: "Polyester",
    properties: {
      weight: "180 GSM",
      composition: "100% rPET",
      certification: "GRS Certified",
    },
    suppliers: 2,
    products: 8,
    status: "active",
  },
  {
    id: "MAT-003",
    name: "Merino Wool",
    category: "Natural Fibers",
    type: "Wool",
    properties: {
      weight: "200 GSM",
      composition: "100% Merino Wool",
      certification: "RWS Certified",
    },
    suppliers: 1,
    products: 4,
    status: "pending",
  },
];

export function SystemMaterials() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-lg font-semibold">Material Catalog</h2>
          <p className="text-sm text-muted-foreground">
            Manage materials, properties, and supplier information
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/system/materials/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Suppliers</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.id} · {material.type}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{material.properties.weight}</p>
                      <p className="text-sm">{material.properties.composition}</p>
                      <Badge variant="secondary">
                        {material.properties.certification}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{material.category}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/system/materials/${material.id}/suppliers`}
                      className="text-primary hover:underline"
                    >
                      {material.suppliers} suppliers
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/system/materials/${material.id}/products`}
                      className="text-primary hover:underline"
                    >
                      {material.products} products
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={material.status === "active" ? "success" : "warning"}
                    >
                      {material.status}
                    </Badge>
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
                          <Link href={`/admin/system/materials/${material.id}`}>
                            Edit Material
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/system/materials/${material.id}/suppliers`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Suppliers
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete
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
    </div>
  );
}