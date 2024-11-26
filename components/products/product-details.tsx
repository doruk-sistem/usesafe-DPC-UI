"use client";

import {
  ArrowLeft,
  Download,
  AlertTriangle,
  HardHat,
  Warehouse,
  Skull,
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
    { src: "/images/hazard-explosive.gif", alt: "Explosive", description: "Risk of explosion under specific conditions" },
    { src: "/images/hazard-warning.png", alt: "Warning", description: "General safety warning" },
    { src: "/images/hazard-corrosive.gif", alt: "Corrosive", description: "Contains corrosive materials" },
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

        {/* Hazard Pictograms */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skull className="h-5 w-5 text-destructive" />
              <CardTitle>Hazard Pictograms</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-8 justify-center">
              {hazardPictograms.map((pictogram, index) => (
                // <div key={index} className="text-center">
                //   <div className="w-24 h-24 relative mb-2">
                //     <Image
                //       src={pictogram.src}
                //       alt={pictogram.alt}
                //       fill
                //       className="object-contain"
                //     />
                //   </div>
                //   <p className="text-sm text-muted-foreground">{pictogram.alt}</p>
                // </div>
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

        {/* Health and Safety Section */}
        <Card className="md:col-span-2">
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
        <Card className="md:col-span-2">
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
        <Card className="md:col-span-2">
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

        {/* QR Code */}
        <Card className="md:col-span-2">
          <ProductQR productId={product.id} productName={product.name} />
        </Card>
      </div>
    </div>
  );
}