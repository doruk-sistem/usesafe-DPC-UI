"use client";

import { Html5Qrcode } from "html5-qrcode";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface QRScannerProps {
  onScan: (code: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      if (!containerRef.current) return;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error("No cameras found on your device.");
      }

      // Initialize scanner if not already done
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerRef.current.id);
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        (error) => {
          // Only log actual errors, not failed scans
          if (error?.name !== "NotFoundException") {
            console.error("Scan error:", error);
          }
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error("Scanner error:", error);
      toast({
        title: "Camera Error",
        description: error instanceof Error ? error.message : "Failed to access camera. Please check permissions.",
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
        {isScanning ? "Stop Scanner" : "Start Scanner"}
      </Button>

      {isScanning && (
        <div className="relative">
          <div 
            ref={containerRef}
            id="qr-scanner-container" 
            className="overflow-hidden rounded-lg"
            style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
          />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Position the QR code within the frame to scan
          </p>
        </div>
      )}
    </div>
  );
}