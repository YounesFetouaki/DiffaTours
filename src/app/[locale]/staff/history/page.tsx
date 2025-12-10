"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, CheckCircle, XCircle, Calendar, User, Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import Header from "@/components/sections/header";

export default function ScanHistoryPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "valid" | "invalid">("all");

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push("/sign-in?redirect=/staff/history");
      return;
    }

    const userRole = user.publicMetadata?.role as string | undefined;
    if (userRole !== "staff" && userRole !== "admin") {
      router.push("/");
      return;
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    if (user) {
      fetchScans();
    }
  }, [user]);

  const fetchScans = async () => {
    try {
      const response = await fetch("/api/badges/scan-history?limit=100");

      if (response.ok) {
        const data = await response.json();
        setScans(data.scans || []);
      }
    } catch (error) {
      console.error("Error fetching scans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredScans = scans.filter((scan) => {
    if (filter === "all") return true;
    if (filter === "valid") return scan.is_valid;
    if (filter === "invalid") return !scan.is_valid;
    return true;
  });

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-32">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
            <p className="text-muted">Loading scan history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const validCount = scans.filter((s) => s.is_valid).length;
  const invalidCount = scans.filter((s) => !s.is_valid).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-40 pointer-events-none" />
      <main className="flex-1 pt-40 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link
              href="/staff"
              className="inline-flex items-center text-primary hover:text-primary/80 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-2">Scan History</h1>
            <p className="text-muted">View all badge scans</p>
          </div>

          <div className="bg-white p-4 shadow-md mb-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 font-semibold transition-colors ${
                  filter === "all"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                }`}
              >
                All ({scans.length})
              </button>
              <button
                onClick={() => setFilter("valid")}
                className={`px-4 py-2 font-semibold transition-colors ${
                  filter === "valid"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                }`}
              >
                Valid ({validCount})
              </button>
              <button
                onClick={() => setFilter("invalid")}
                className={`px-4 py-2 font-semibold transition-colors ${
                  filter === "invalid"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                }`}
              >
                Invalid ({invalidCount})
              </button>
            </div>
          </div>

          <div className="bg-white shadow-md">
            {filteredScans.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted mx-auto mb-4 opacity-30" />
                <p className="text-muted text-lg">No scans found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredScans.map((scan) => {
                  const isValid = scan.is_valid;
                  return (
                    <div
                      key={scan.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {isValid ? (
                              <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : (
                              <XCircle className="w-8 h-8 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-bold text-foreground">
                                {scan.badge?.tourist_name || "Unknown Tourist"}
                              </h3>
                              <span
                                className={`px-3 py-1 text-xs font-semibold ${
                                  isValid
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {isValid ? "VALID" : "INVALID"}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-muted">
                              <p>Badge Code: {scan.badge_code}</p>
                              <p className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Scanned by: {scan.scanner_name} ({scan.scanner_email})
                              </p>
                              <p className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(scan.scanned_at).toLocaleString()}
                              </p>
                              {scan.scan_location && (
                                <p>Location: {scan.scan_location}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}