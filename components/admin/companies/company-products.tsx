"use client";

import { Plus, Search, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
import { useProducts } from "@/lib/hooks/use-products";

interface CompanyProductsProps {
  companyId: string;
}

export function CompanyProducts({ companyId }: CompanyProductsProps) {
  const t = useTranslations("admin.products");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { products, isLoading, error } = useProducts(companyId);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("list.error.title")}</CardTitle>
          <CardDescription>{t("list.error.description")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("loading")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
            <CardTitle>{t("list.title")}</CardTitle>
            <CardDescription>{t("list.description")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t("list.search.placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[200px]"
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("list.filter.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("list.filter.all")}</SelectItem>
                <SelectItem value="active">{t("list.filter.active")}</SelectItem>
                <SelectItem value="inactive">{t("list.filter.inactive")}</SelectItem>
                <SelectItem value="pending">{t("list.filter.pending")}</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("list.actions.add")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("list.columns.name")}</TableHead>
              <TableHead>{t("list.columns.sku")}</TableHead>
              <TableHead>{t("list.columns.status")}</TableHead>
              <TableHead>{t("list.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>
                  <Badge variant={product.status === "active" ? "default" : "secondary"}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t("list.actions.title")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("list.actions.title")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        {t("list.actions.view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {t("list.actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {t("list.actions.delete")}
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
