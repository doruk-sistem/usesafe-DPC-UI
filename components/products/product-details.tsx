"use client";

import {
  ArrowLeft,
  Download,
  AlertTriangle,
  HardHat,
  Warehouse,
  Skull,
  Box,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProductQR } from "@/components/products/product-qr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/lib/data/products";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const hazardPictograms = [
    { src: "/images/hazard-health.gif", alt: "Health Hazard", description: "May cause respiratory irritation" },
    { src: "/images/hazard-explosive.gif", alt: "Corrosive", description: "Contains corrosive materials" },
    { src: "/images/hazard-warning.png", alt: "Warning", description: "General safety warning" },
    { src: "/images/hazard-explosive.jpeg", alt: "Explosive", description: "Risk of explosion under specific conditions" },
    { src: "/images/hazard-environmental.png", alt: "Environmental Hazard", description: "May pollute water sources" },
  ];

  const safetyMeasures = [
    "Always carry the batteries carefully.",
    "Always keep in the upright position.",
    "Charge in a well-ventilated place.",
    "Do not add extra quantities of pure water. (Pure water level must not be more than 1.5 cm above the plates.)",
    "During battery maintenance (addition of water, cleaning, battery charge), absolutely wear protective goggles suitable with working conditions.",
    "In case of any possible acid splash risk, wear protective clothing.",
  ];

  const emergencyProcedures = [
    "In case of contact with eyes or skin wash with plenty of water.",
    "Immediately remove contaminated clothing.",
    "Ingestion: Drink plenty of water and milk. Consult a physician.",
    "Spill: Wash small-spills with water.",
    "Operating batteries emit highly flammable hydrogen and oxygen gases.",
    "Do not smoke or avoid any sources and acts which may cause sparks near batteries which are being charged, operating on the vehicle, or stopped after a long operation period.",
    "Keep fire away.",
    "Use all devices with great care.",
  ];

  const storageGuidelines = [
    {
      title: "General Storage",
      items: [
        "Always store in a dry and cool place in the upright position. (10°C to 25°C).",
        "Place batteries on a wood pallet for avoiding direct contact with concrete ground.",
      ]
    },
    {
      title: "Charge Level Monitoring",
      items: [
        "Charge level of the battery must be greater than 12.6V before sale.",
        "During storage, the minimum voltage must be 12.4V.",
        "For preventing permanent damage, unpack and charge at 16.1V and 1/20Cn current if voltage is low.",
      ]
    },
    {
      title: "Installation Steps",
      items: [
        "Verify battery compatibility with vehicle manual",
        "Ensure engine is switched off",
        "Remove old battery (negative terminal first)",
        "Conduct short-circuit control",
        "Clean battery compartment and terminals",
        "Install new battery (connect positive cable first)",
        "Check charge current compatibility",
      ]
    }
  ];

  return (
    <div className="container mx-auto space-y-12 px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="gradient-hover">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      {/* Product Overview */}
      <div className="grid gap-8 lg:grid-cols-2 items-start max-w-[1400px] mx-auto">
        <div className="space-y-6">
          <div className="aspect-square relative rounded-lg overflow-hidden bg-white shadow-lg group">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square relative rounded-md overflow-hidden bg-white shadow-md cursor-pointer hover:ring-2 ring-primary/50 transition-all duration-200">
                <Image
                  src={product.image}
                  alt={`${product.name} view ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4 sticky top-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
              {product.name}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-background to-muted/50 shadow-md card-hover">
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-semibold">{product.basicInfo.model}</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-background to-muted/50 shadow-md card-hover">
              <p className="text-sm text-muted-foreground">Serial Number</p>
              <p className="font-semibold">{product.basicInfo.serialNumber}</p>
            </div>
          </div>

          <div className="border-t border-b py-6 space-y-4 border-border/50">
            <h2 className="text-xl font-semibold">Key Features</h2>
            <div className="grid grid-cols-2 gap-4">
              {product.technicalSpecs.map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary"></div>
                  <span className="text-sm font-medium">{spec.name}:</span>
                  <span className="text-sm text-muted-foreground">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mt-16 max-w-[1400px] mx-auto">
        {/* Basic Information */}
        <Card className="bg-gradient-to-br from-background to-muted shadow-lg card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(product.basicInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </dt>
                  <dd className="text-sm text-primary">{value}</dd>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card className="bg-gradient-to-br from-background to-muted shadow-lg card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {product.technicalSpecs.map((spec, index) => (
                <div key={index} className="flex justify-between">
                  <dt className="text-sm font-medium">{spec.name}</dt>
                  <dd className="text-sm text-primary">{spec.value}</dd>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hazard Pictograms */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skull className="h-5 w-5 text-destructive" />
              <CardTitle>Hazard Pictograms</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-8 justify-center">
              {hazardPictograms.map((pictogram, index) => (
                <div className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-white" key={index} >
                <div className="relative w-24 h-24">
                  <Image
                    src={pictogram.src}
                    alt={pictogram.alt}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">{pictogram.alt}</h3>
                  <p className="text-sm text-muted-foreground">{pictogram.description}</p>
                </div>
              </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Materials */}
        <Card className="lg:col-span-2">
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

        {/* Health and Safety Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-primary" />
              <CardTitle>Health and Safety Measures</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 list-disc pl-6">
              {safetyMeasures.map((measure, index) => (
                <li key={index} className="text-muted-foreground">
                  {measure}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Emergency Procedures */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Emergency Procedures</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 list-disc pl-6">
              {emergencyProcedures.map((procedure, index) => (
                <li key={index} className="text-muted-foreground">
                  {procedure}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Storage and Installation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              <CardTitle>Storage and Installation Guidelines</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {storageGuidelines.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card className="lg:col-span-2">
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
        <Card className="lg:col-span-2">
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

        {/* QR Code */}
        <Card className="lg:col-span-2">
          <ProductQR productId={product.id} productName={product.name} />
        </Card>
      </div>
    </div>
  );
}