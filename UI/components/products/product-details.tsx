"use client";

import { Product } from "@/lib/data/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      {/* Product Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <div className="aspect-video relative">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
          <CardHeader>
            <div className="space-y-2">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </CardHeader>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              {Object.entries(product.basicInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-sm text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </dt>
                  <dd className="text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              {product.technicalSpecs.map((spec, index) => (
                <div key={index} className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">{spec.name}</dt>
                  <dd className="text-sm font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Materials */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Recyclable</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.materials.map((material, index) => (
                  <TableRow key={index}>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.percentage}%</TableCell>
                    <TableCell>
                      <Badge variant={material.recyclable ? "success" : "secondary"}>
                        {material.recyclable ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>{material.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certification</TableHead>
                  <TableHead>Issued By</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Document</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.certifications.map((cert, index) => (
                  <TableRow key={index}>
                    <TableCell>{cert.name}</TableCell>
                    <TableCell>{cert.issuedBy}</TableCell>
                    <TableCell>{new Date(cert.validUntil).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={cert.status === "valid" ? "success" : "destructive"}>
                        {cert.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cert.documentUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={cert.documentUrl}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sustainability Metrics */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sustainability Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Sustainability Score</span>
                <Badge
                  variant={
                    product.sustainabilityScore >= 80 ? "success" :
                    product.sustainabilityScore >= 60 ? "warning" : "destructive"
                  }
                >
                  {product.sustainabilityScore}%
                </Badge>
              </div>
              <Progress value={product.sustainabilityScore} className="h-2" />
            </div>
            <div>
              <span className="font-medium">Carbon Footprint</span>
              <p className="text-muted-foreground">{product.carbonFootprint}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}