"use client";

import { Html5Qrcode } from "html5-qrcode";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface QRScannerProps {
  onScan: (code: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-scanner-reader";
  const t = useTranslations("verify.verification.scanner");

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error("No cameras found on your device.");
      }

      // Initialize scanner if not already done
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerId);
      }

      // Try to use the back camera first
      const cameraId = cameras.length > 1 ? cameras[1].id : cameras[0].id;

      await scannerRef.current.start(
        { deviceId: { exact: cameraId } },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {
          // Ignore QR scanning errors as they're expected when no QR code is in view
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error("Scanner error:", error);
      
      // If device selection fails, try with basic constraints
      if (scannerRef.current) {
        try {
          await scannerRef.current.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              onScan(decodedText);
              stopScanner();
            },
            () => {
              // Ignore QR scanning errors
            }
          );
          setIsScanning(true);
          return;
        } catch (fallbackError) {
          console.error("Fallback scanner error:", fallbackError);
        }
      }

      toast({
        title: t("error.title"),
        description: t("error.description"),
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      setIsScanning(false);
    } catch (error) {
      console.error("Failed to stop scanner:", error);
    }
  };

  const toggleScanner = () => {
    if (isScanning) {
      stopScanner();
    } else {
      startScanner();
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full"
        onClick={toggleScanner}
      >
        <Camera className="mr-2 h-4 w-4" />
        {isScanning ? t("stop") : t("start")}
      </Button>

      <div className="relative">
        <div 
          id={scannerId}
          className={`overflow-hidden rounded-lg transition-opacity ${isScanning ? 'opacity-100' : 'opacity-0 h-0'}`}
          style={{ 
            width: '100%', 
            maxWidth: '500px', 
            margin: '0 auto',
            aspectRatio: '1',
          }}
        />
        {isScanning && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center">
              <div className="animate-pulse w-16 h-1 bg-primary rounded" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {t("positioning")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}