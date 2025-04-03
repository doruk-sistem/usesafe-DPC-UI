"use client";

import { motion } from "framer-motion";
import { Skull } from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HazardPictogram {
  src: string;
  alt: string;
  description: string;
}

interface HazardPictogramsCardProps {
  title: string;
  pictograms: HazardPictogram[];
}

export function HazardPictogramsCard({
  title,
  pictograms,
}: HazardPictogramsCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skull className="h-5 w-5 text-destructive" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 justify-center">
          {pictograms.map((pictogram, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-white"
            >
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
                <p className="text-sm text-muted-foreground">
                  {pictogram.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
