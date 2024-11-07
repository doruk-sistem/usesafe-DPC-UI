"use client";

import Link from "next/link";
import { sampleDPPs } from "@/lib/data/sample-dpps";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package2 } from "lucide-react";

export function DPPList() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sampleDPPs.map((dpp) => (
        <Link href={`/dpp/${dpp.id}`} key={dpp.id}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{dpp.productName}</CardTitle>
              </div>
              <CardDescription>{dpp.manufacturer}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge variant="secondary">{dpp.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sustainability Score</span>
                  <Badge 
                    variant={dpp.sustainabilityScore >= 80 ? "success" : 
                            dpp.sustainabilityScore >= 60 ? "warning" : "destructive"}
                  >
                    {dpp.sustainabilityScore}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Carbon Footprint</span>
                  <span className="text-sm font-medium">{dpp.carbonFootprint}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );