"use client";

import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductQRProps {
  productId: string;
  productName: string;
}

export function ProductQR({ productId, productName }: ProductQRProps) {
  const qrValue = `${window.location.origin}/products/${productId}`;
  const qrFileName = `${productName.toLowerCase().replace(/\s+/g, '-')}-qr.png`;

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = qrFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Product QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG
            value={qrValue}
            size={200}
            level="H"
            includeMargin
            imageSettings={{
              src: "/images/logo.avif",
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        </div>
        <Button variant="outline" onClick={downloadQR}>
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Scan this code to verify product authenticity
        </p>
      </CardContent>
    </Card>
  );
}