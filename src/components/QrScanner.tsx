"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, AlertCircle } from "lucide-react";

interface QrScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export default function QrScanner({ onScan, onError }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        startScanning();
      }
    } catch (err) {
      const errorMessage = "Unable to access camera. Please check permissions.";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };

  const startScanning = () => {
    scanIntervalRef.current = setInterval(() => {
      scanQRCode();
    }, 500);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Use jsQR library to decode QR code
    try {
      // @ts-ignore - jsQR is loaded via CDN
      const code = window.jsQR?.(imageData.data, imageData.width, imageData.height);

      if (code?.data) {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
        }
        onScan(code.data);
      }
    } catch (err) {
      console.error("QR scanning error:", err);
    }
  };

  return (
    <div className="relative">
      {error ? (
        <div className="flex flex-col items-center justify-center h-96 bg-red-50 border-2 border-red-200">
          <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
          <p className="text-red-600 text-center px-4">{error}</p>
        </div>
      ) : (
        <>
          <div className="relative aspect-square max-h-96 bg-black overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <div className="absolute inset-0 border-4 border-primary/50">
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary"></div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <div className="inline-block bg-black/70 px-4 py-2">
                <p className="text-white text-sm flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Position QR code in the frame
                </p>
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
}
