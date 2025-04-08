"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Package, Search, Filter, MoreHorizontal, FileText, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  images?: {
    url: string;
    alt: string;
    is_primary: boolean;
  }[];
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
            documents,
            images
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
            images: product.images || [],
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
    <Card className="border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Products</CardTitle>
            <CardDescription className="text-base mt-1">
              Manage and review all products in the system
            </CardDescription>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/admin/products/new">
              <Package className="mr-2 h-4 w-4" />
              Add New Product
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6 bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
            <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
              <SelectTrigger className="w-[200px] bg-background">
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
              <SelectTrigger className="w-[200px] bg-background">
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
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Products Found</h3>
              <p className="text-muted-foreground">
                {products.length === 0 
                  ? "No products have been added yet."
                  : "No products match the current filter criteria."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-square relative bg-muted overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={product.images.find(img => img.is_primary)?.url || product.images[0].url}
                          alt={product.images.find(img => img.is_primary)?.alt || product.name}
                          className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://placehold.co/400x400?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <Package className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-medium line-clamp-1">
                        <Link href={`/admin/products/${product.id}`} className="hover:text-primary transition-colors">
                          {product.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Created: {new Date(product.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/documents?product=${product.id}`} className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            View Documents
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Manufacturer</span>
                      <span className="text-sm font-medium">{product.manufacturer_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <Badge variant="outline" className="font-normal">
                        {product.product_type || "Uncategorized"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Documents</span>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {product.document_count} {product.document_count === 1 ? 'document' : 'documents'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge 
                        variant={getStatusVariant(product.document_status)}
                        className="font-medium"
                      >
                        {product.document_status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 