"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { QrCode, History, CheckCircle, XCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import Header from "@/components/sections/header";

export default function StaffDashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [stats, setStats] = useState({
    todayScans: 0,
    validScans: 0,
    invalidScans: 0,
    recentScans: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push("/sign-in?redirect=/staff");
      return;
    }

    // Fetch user role from MongoDB
    fetchUserRole();
  }, [user, isLoaded, router]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const role = data.data?.role;
        setUserRole(role);

        if (role !== "staff" && role !== "admin") {
          router.push("/");
          return;
        }

        // Fetch stats after confirming role
        fetchStats();
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      router.push("/");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/badges/scan-history");

      if (response.ok) {
        const data = await response.json();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayScans = data.scans?.filter((scan: any) => {
          const scanDate = new Date(scan.scanned_at);
          scanDate.setHours(0, 0, 0, 0);
          return scanDate.getTime() === today.getTime();
        }) || [];

        const validScans = todayScans.filter((scan: any) => scan.is_valid).length;
        const invalidScans = todayScans.filter((scan: any) => !scan.is_valid).length;

        setStats({
          todayScans: todayScans.length,
          validScans,
          invalidScans,
          recentScans: data.scans?.slice(0, 5) || []
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading || userRole === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading staff panel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div 
      className="min-h-screen bg-background flex flex-col section-overlay" 
      style={{ 
        backgroundImage: 'url(https://www.cadderha.co.uk/wp-content/uploads/2019/10/Staff.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Header />
      <main className="flex-1 pt-40 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-white mb-2">Staff Panel</h1>
            <p className="text-white/90">Welcome, {user.fullName || user.primaryEmailAddress?.emailAddress}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/95 backdrop-blur-sm p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted mb-1">Today's Scans</p>
                  <p className="text-3xl font-bold text-foreground">{stats.todayScans}</p>
                </div>
                <QrCode className="w-12 h-12 text-primary opacity-20" />
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted mb-1">Valid Badges</p>
                  <p className="text-3xl font-bold text-green-600">{stats.validScans}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted mb-1">Invalid Badges</p>
                  <p className="text-3xl font-bold text-red-600">{stats.invalidScans}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              href="/staff/scanner"
              className="bg-primary hover:bg-primary/90 text-white p-8 shadow-md hover:shadow-lg transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Scan QR Code</h3>
                  <p className="text-white/90">Verify tourist badges</p>
                </div>
              </div>
            </Link>

            <Link
              href="/staff/history"
              className="bg-accent hover:bg-accent/90 text-white p-8 shadow-md hover:shadow-lg transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <History className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Scan History</h3>
                  <p className="text-white/90">View all scanned badges</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-6 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Recent Scans</h2>
            {stats.recentScans.length === 0 ? (
              <p className="text-muted text-center py-8">No scans yet today</p>
            ) : (
              <div className="space-y-3">
                {stats.recentScans.map((scan: any) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-4 border border-border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {scan.is_valid ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <div>
                        <p className="font-semibold">{scan.badge?.tourist_name || "Unknown"}</p>
                        <p className="text-sm text-muted">
                          {new Date(scan.scanned_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold ${
                          scan.is_valid
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {scan.is_valid ? "VALID" : "INVALID"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}