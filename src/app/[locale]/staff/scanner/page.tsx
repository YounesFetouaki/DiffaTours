"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, Camera, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import dynamic from "next/dynamic";
import Header from "@/components/sections/header";

const QrScanner = dynamic(() => import("@/components/QrScanner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

export default function ScannerPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in?redirect=/staff/scanner");
      return;
    }

    const userRole = user.publicMetadata?.role as string | undefined;
    if (userRole !== "staff" && userRole !== "admin") {
      router.push("/");
      return;
    }
  }, [user, isLoaded, router]);

  const handleScan = async (badgeCode: string) => {
    if (!badgeCode || isVerifying) return;

    console.log("Raw scanned data:", badgeCode);

    // Extract badge code from URL if it's a full URL
    let cleanedBadgeCode = badgeCode.trim();

    // Check if it's a URL containing /badge/
    if (cleanedBadgeCode.includes('/badge/')) {
      const parts = cleanedBadgeCode.split('/badge/');
      if (parts.length > 1) {
        cleanedBadgeCode = parts[1].split('?')[0].split('#')[0].trim(); // Remove query params and hash
      }
    }

    // Also check for http:// or https:// and extract just the badge code
    if (cleanedBadgeCode.startsWith('http://') || cleanedBadgeCode.startsWith('https://')) {
      try {
        const url = new URL(cleanedBadgeCode);
        const pathParts = url.pathname.split('/');
        const badgeIndex = pathParts.indexOf('badge');
        if (badgeIndex !== -1 && pathParts[badgeIndex + 1]) {
          cleanedBadgeCode = pathParts[badgeIndex + 1];
        }
      } catch (e) {
        console.error("Failed to parse URL:", e);
      }
    }

    console.log("Cleaned badge code:", cleanedBadgeCode);

    if (!cleanedBadgeCode) {
      setScanResult({
        success: false,
        message: "Invalid QR code - no badge code detected",
      });
      return;
    }

    setIsVerifying(true);
    setIsScanning(false);

    try {
      const requestBody = {
        badgeCode: cleanedBadgeCode,
        scanLocation: "Scanner App",
        deviceInfo: navigator.userAgent
      };

      console.log("Sending request:", requestBody);

      const response = await fetch("/api/badges/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok && data.result === 'valid') {
        setScanResult({
          success: true,
          data: data.badge,
          message: data.message,
        });
      } else {
        setScanResult({
          success: false,
          message: data.message || data.error || "Invalid badge",
        });
      }
    } catch (error) {
      console.error("Error verifying badge:", error);
      setScanResult({
        success: false,
        message: "Error verifying badge. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  // Improved helper function to parse trip details
  const parseTripDetails = (tripDetails: any): React.ReactNode => {
    if (!tripDetails) {
      return <span className="text-muted">No excursion details available</span>;
    }

    try {
      let parsed = tripDetails;

      // If it's a string, try to parse it
      if (typeof tripDetails === 'string') {
        parsed = JSON.parse(tripDetails);
      }

      // If it's an array of excursions
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-3">
            {parsed.map((item: any, index: number) => (
              <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="font-semibold text-foreground mb-1">
                  {item.excursionName || item.name || 'Excursion'}
                </p>
                <div className="text-sm text-muted space-y-1">
                  {item.date && item.date !== 'N/A' && (
                    <p>📅 Date: {new Date(item.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  )}
                  <p>
                    👥 {item.adults || 0} adult(s)
                    {(item.children || 0) > 0 && ` • ${item.children} child(ren)`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // If it's a single object
      if (typeof parsed === 'object' && parsed !== null) {
        return (
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <p className="font-semibold text-foreground mb-1">
              {parsed.excursionName || parsed.name || 'Excursion'}
            </p>
            <div className="text-sm text-muted space-y-1">
              {parsed.date && parsed.date !== 'N/A' && (
                <p>📅 Date: {new Date(parsed.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              )}
              <p>
                👥 {parsed.adults || 0} adult(s)
                {(parsed.children || 0) > 0 && ` • ${parsed.children} child(ren)`}
              </p>
            </div>
          </div>
        );
      }

      // Fallback: display as string
      return <span>{String(parsed)}</span>;

    } catch (e) {
      console.error('Error parsing trip details:', e, tripDetails);
      // Return the raw string if parsing fails
      return <span className="text-muted">{typeof tripDetails === 'string' ? tripDetails : 'Unable to parse excursion details'}</span>;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading scanner...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main
        className="flex-1 pt-40 pb-8 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url(https://plus.unsplash.com/premium_photo-1701534008693-0eee0632d47a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2Vic2l0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D)'
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/staff"
              className="inline-flex items-center text-primary hover:text-primary/80 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-2">QR Scanner</h1>
            <p className="text-muted">Scan tourist badges to verify identity</p>
          </div>

          <div className="bg-white p-6 shadow-md">
            {!scanResult ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Scan Badge QR Code</h2>
                  <p className="text-muted">
                    Position the QR code within the camera frame to scan
                  </p>
                </div>

                {isVerifying ? (
                  <div className="flex flex-col items-center justify-center h-96 bg-gray-100">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-muted">Verifying badge...</p>
                  </div>
                ) : (
                  <QrScanner
                    onScan={handleScan}
                    onError={(error) => {
                      console.error("Scanner error:", error);
                      setScanResult({
                        success: false,
                        message: "Camera access denied or error occurred",
                      });
                    }}
                  />
                )}
              </div>
            ) : (
              <div>
                <div
                  className={`p-8 mb-6 ${scanResult.success ? "bg-green-50" : "bg-red-50"
                    }`}
                >
                  <div className="flex flex-col items-center text-center">
                    {scanResult.success ? (
                      <CheckCircle className="w-20 h-20 text-green-600 mb-4" />
                    ) : (
                      <XCircle className="w-20 h-20 text-red-600 mb-4" />
                    )}
                    <h2
                      className={`text-3xl font-bold mb-2 ${scanResult.success ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {scanResult.success ? "VALID BADGE" : "INVALID BADGE"}
                    </h2>
                    <p className="text-muted mb-4">{scanResult.message}</p>
                  </div>
                </div>

                {scanResult.success && scanResult.data && (
                  <div className="space-y-4 mb-6">
                    <div className="border-b border-border pb-3">
                      <p className="text-sm text-muted mb-1">Visitor Name</p>
                      <p className="text-xl font-bold">{scanResult.data.touristName}</p>
                    </div>
                    <div className="border-b border-border pb-3">
                      <p className="text-sm text-muted mb-1">Email Address</p>
                      <p className="text-lg">{scanResult.data.email}</p>
                    </div>
                    <div className="border-b border-border pb-3">
                      <p className="text-sm text-muted mb-1">Phone Number</p>
                      <p className="text-lg font-semibold">{scanResult.data.phone || 'N/A'}</p>
                    </div>
                    <div className="border-b border-border pb-3">
                      <p className="text-sm text-muted mb-1">Order Number</p>
                      <p className="text-lg font-mono">{scanResult.data.orderNumber}</p>
                    </div>
                    <div className="border-b border-border pb-3">
                      <p className="text-sm text-muted mb-2">Excursion Details</p>
                      <div className="text-lg">
                        {parseTripDetails(scanResult.data.tripDetails)}
                      </div>
                    </div>
                    <div className="border-b border-border pb-3">
                      <p className="text-sm text-muted mb-1">Valid Until</p>
                      <p className="text-lg">
                        {scanResult.data.validUntil
                          ? new Date(scanResult.data.validUntil).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                          : "No expiration"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted mb-1">Badge Status</p>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold">
                        {scanResult.data.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={resetScanner}
                    className="flex-1 btn btn-primary"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Scan Another Badge
                  </button>
                  <Link href="/staff" className="flex-1 btn btn-outline">
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}