"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { products } from "@/lib/data/products";

export function ProductList() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link href={`/products/${product.id}`} key={product.id}>
          <Card className="hover:shadow-lg transition-shadow overflow-hidden">
            <div className="aspect-video relative">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.manufacturer}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sustainability Score</span>
                  <Badge 
                    variant={product.sustainabilityScore >= 80 ? "success" : 
                            product.sustainabilityScore >= 60 ? "warning" : "destructive"}
                  >
                    {product.sustainabilityScore}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Carbon Footprint</span>
                  <span className="text-sm font-medium">{product.carbonFootprint}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}