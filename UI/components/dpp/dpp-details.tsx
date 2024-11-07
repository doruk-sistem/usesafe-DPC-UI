"use client";

import { DPP } from "@/lib/data/sample-dpps";
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
  Package2,
  Factory,
  Recycle,
  Award,
  Timeline,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DPPDetailsProps {
  dpp: DPP;
}

export function DPPDetails({ dpp }: DPPDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dpp">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </Link>
      </div>

      {/* Product Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package2 className="h-6 w-6 text-primary" />
            <CardTitle>{dpp.productName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Manufacturer</span>
            <p className="font-medium">{dpp.manufacturer}</p>
          </div>
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Serial Number</span>
            <p className="font-medium">{dpp.serialNumber}</p>
          </div>
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Manufacturing Date</span>
            <p className="font-medium">{new Date(dpp.manufacturingDate).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Sustainability Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-primary" />
            <CardTitle>Sustainability Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Sustainability Score</span>
              <Badge
                variant={
                  dpp.sustainabilityScore >= 80 ? "success" :
                  dpp.sustainabilityScore >= 60 ? "warning" : "destructive"
                }
              >
                {dpp.sustainabilityScore}%
              </Badge>
            </div>
            <Progress value={dpp.sustainabilityScore} className="h-2" />
          </div>
          <div>
            <span className="font-medium">Carbon Footprint</span>
            <p className="text-muted-foreground">{dpp.carbonFootprint}</p>
          </div>
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-primary" />
            <CardTitle>Materials Composition</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Recyclable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dpp.materials.map((material, index) => (
                <TableRow key={index}>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>{material.percentage}%</TableCell>
                  <TableCell>
                    <Badge variant={material.recyclable ? "success" : "secondary"}>
                      {material.recyclable ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <CardTitle>Certifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certification</TableHead>
                <TableHead>Issued By</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dpp.certifications.map((cert, index) => (
                <TableRow key={index}>
                  <TableCell>{cert.name}</TableCell>
                  <TableCell>{cert.issuedBy}</TableCell>
                  <TableCell>{new Date(cert.validUntil).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={cert.status === "valid" ? "success" : "destructive"}>
                      {cert.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lifecycle */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Timeline className="h-6 w-6 text-primary" />
            <CardTitle>Product Lifecycle</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dpp.lifecycle.map((stage, index) => (
              <div key={index} className="relative pl-6 pb-6 last:pb-0 border-l-2 border-muted last:border-l-0">
                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />
                <div className="space-y-1">
                  <div className="font-medium">{stage.stage}</div>
                  <div className="text-sm text-muted-foreground">{stage.location}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(stage.date).toLocaleDateString()}
                  </div>
                  <p className="text-sm">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}