"use client";

import { Download } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface ProductQRProps {
  productId: string;
  productName: string;
}

export function ProductQR({ productId, productName }: ProductQRProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const { toast } = useToast();
  
  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = `${window.location.origin}/products/${productId}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
        toast({
          title: "Error",
          description: "Failed to generate QR code",
          variant: "destructive",
        });
      }
    };

    generateQR();
  }, [productId, toast]);

  const downloadQR = () => {
    if (!qrDataUrl) {
      toast({
        title: "Error",
        description: "QR code is not ready yet",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${productName.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Product QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {qrDataUrl && (
          <div className="bg-white p-4 rounded-lg">
            <img
              src={qrDataUrl}
              alt="Product QR Code"
              className="w-[200px] h-[200px]"
            />
          </div>
        )}
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