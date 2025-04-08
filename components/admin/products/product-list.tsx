"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Package, Search, Filter, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  manufacturer_id: string;
  manufacturer_name: string;
  product_type: string;
  status: string;
  created_at: string;
  document_count: number;
  document_status: "All Approved" | "Pending Review" | "Has Rejected Documents" | "No Documents";
}

interface Document {
  status: "approved" | "rejected" | "pending";
}

export function ProductList() {
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [manufacturerFilter, setManufacturerFilter] = useState("all");
  const [manufacturers, setManufacturers] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Önce manufacturers'ı çek (companies tablosundan)
        const { data: manufacturersData, error: manufacturersError } = await supabase
          .from("companies")
          .select("id, name")
          .eq("companyType", "manufacturer");

        if (manufacturersError) {
          throw new Error(`Manufacturers fetch error: ${manufacturersError.message}`);
        }

        if (!manufacturersData) {
          throw new Error("No manufacturers data received");
        }

        const manufacturerMap = manufacturersData.reduce((acc, manufacturer) => {
          acc[manufacturer.id] = manufacturer.name;
          return acc;
        }, {} as Record<string, string>);

        setManufacturers(manufacturerMap);

        // Sonra products'ı çek
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(`
            id,
            name,
            manufacturer_id,
            product_type,
            status,
            created_at,
            documents
          `);

        if (productsError) {
          throw new Error(`Products fetch error: ${productsError.message}`);
        }

        if (!productsData) {
          throw new Error("No products data received");
        }

        // Process products to include document counts and status
        const processedProducts = productsData.map(product => {
          const documentCount = product.documents ? Object.values(product.documents).flat().length : 0;
          
          let documentStatus: Product["document_status"] = "No Documents";
          if (documentCount > 0) {
            const allDocs = Object.values(product.documents).flat() as Document[];
            const hasRejected = allDocs.some(doc => doc.status === "rejected");
            const allApproved = allDocs.every(doc => doc.status === "approved");
            
            if (hasRejected) {
              documentStatus = "Has Rejected Documents";
            } else if (allApproved) {
              documentStatus = "All Approved";
            } else {
              documentStatus = "Pending Review";
            }
          }

          return {
            ...product,
            manufacturer_name: manufacturerMap[product.manufacturer_id] || "Unknown Manufacturer",
            document_count: documentCount,
            document_status: documentStatus,
            category: product.product_type
          };
        });

        setProducts(processedProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        toast({
          title: "Error",
          description: `Failed to load products data: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [supabase, toast]);

  const filteredProducts = products.filter(product => {
    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== "all" && product.document_status !== statusFilter) {
      return false;
    }
    
    // Filter by manufacturer
    if (manufacturerFilter !== "all" && product.manufacturer_id !== manufacturerFilter) {
      return false;
    }
    
    return true;
  });

  const getStatusVariant = (status: string): "default" | "success" | "warning" | "destructive" | "secondary" => {
    switch (status) {
      case "All Approved":
        return "success";
      case "Pending Review":
        return "warning";
      case "Has Rejected Documents":
        return "destructive";
      case "No Documents":
        return "secondary";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Loading products...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Management</CardTitle>
        <CardDescription>
          Review and manage all products in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by manufacturer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {Object.entries(manufacturers).map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="All Approved">All Approved</SelectItem>
              <SelectItem value="Pending Review">Pending Review</SelectItem>
              <SelectItem value="Has Rejected Documents">Has Rejected Documents</SelectItem>
              <SelectItem value="No Documents">No Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Product</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                    <p className="text-muted-foreground">
                      {products.length === 0 
                        ? "No products have been added yet."
                        : "No products match the current filter criteria."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link href={`/admin/products/${product.id}`} className="hover:underline">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-400">
                        Created: {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>{product.manufacturer_name}</TableCell>
                  <TableCell>{product.product_type || "Uncategorized"}</TableCell>
                  <TableCell>{product.document_count} {product.document_count === 1 ? 'document' : 'documents'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(product.document_status)}>
                      {product.document_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/documents?product=${product.id}`}>
                            View Documents
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 