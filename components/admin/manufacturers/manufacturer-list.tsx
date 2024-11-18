"use client";

import { MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
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

const manufacturers = [
  {
    id: "MFR-001",
    name: "TechFabrics Ltd",
    email: "contact@techfabrics.com",
    status: "pending",
    documents: 5,
    products: 12,
    registeredAt: "2024-03-15T10:30:00",
  },
  {
    id: "MFR-002",
    name: "EcoTextiles Co",
    email: "info@ecotextiles.com",
    status: "approved",
    documents: 8,
    products: 24,
    registeredAt: "2024-03-14T15:45:00",
  },
  {
    id: "MFR-003",
    name: "Sustainable Wear",
    email: "hello@sustainablewear.com",
    status: "rejected",
    documents: 3,
    products: 0,
    registeredAt: "2024-03-13T09:15:00",
  },
];

export function ManufacturerList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Manufacturers</CardTitle>
        <CardDescription>
          View and manage manufacturer registrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manufacturers.map((manufacturer) => (
              <TableRow key={manufacturer.id}>
                <TableCell className="font-medium">
                  {manufacturer.id}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{manufacturer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {manufacturer.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      manufacturer.status === "approved"
                        ? "success"
                        : manufacturer.status === "rejected"
                        ? "destructive"
                        : "warning"
                    }
                    className="flex w-fit items-center gap-1"
                  >
                    {manufacturer.status === "approved" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : manufacturer.status === "rejected" ? (
                      <XCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {manufacturer.status}
                  </Badge>
                </TableCell>
                <TableCell>{manufacturer.documents}</TableCell>
                <TableCell>{manufacturer.products}</TableCell>
                <TableCell>
                  {new Date(manufacturer.registeredAt).toLocaleDateString()}
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
                        <Link href={`/admin/manufacturers/${manufacturer.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/documents?manufacturer=${manufacturer.id}`}>
                          Review Documents
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/manufacturers/${manufacturer.id}?tab=products`}>
                          View Products
                        </Link>
                      </DropdownMenuItem>
                      {manufacturer.status === "pending" && (
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