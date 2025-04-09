"use client";

import { useState } from "react";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { useProducts } from "@/lib/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

interface CompanyProductsProps {
  companyId: string;
}

export function CompanyProducts({ companyId }: CompanyProductsProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { products, isLoading, error } = useProducts(companyId);

  // Hata durumu
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hata</CardTitle>
          <CardDescription>Ürünler yüklenirken bir hata oluştu.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Yükleme durumu
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ürünler</CardTitle>
          <CardDescription>Yükleniyor...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Filtreleme fonksiyonu
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.sku?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return matchesSearch && product.status === filter;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ürünler</CardTitle>
            <CardDescription>
              Toplam {products.length} ürün bulundu
            </CardDescription>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Ürün Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Arama ve Filtreleme */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum Filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="pending">Beklemede</SelectItem>
              <SelectItem value="draft">Taslak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ürün Tablosu */}
        {filteredProducts.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {search || filter !== "all"
                  ? "Arama kriterlerine uygun ürün bulunamadı."
                  : "Henüz ürün eklenmemiş."}
              </p>
              <Button variant="outline" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                İlk Ürünü Ekle
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün Kodu</TableHead>
                <TableHead>Ürün Adı</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Eklenme Tarihi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "active"
                          ? "success"
                          : product.status === "pending"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {product.status === "active"
                        ? "Aktif"
                        : product.status === "pending"
                        ? "Beklemede"
                        : "Taslak"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(product.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">İşlemler</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Düzenle</DropdownMenuItem>
                        <DropdownMenuItem>Görüntüle</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}