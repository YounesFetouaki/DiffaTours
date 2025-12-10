'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QrCode, Download, Printer, CheckCircle2, XCircle, Calendar, User, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/sections/header';
import { toast } from 'sonner';

interface Badge {
  id: number;
  orderNumber: string;
  badgeCode: string;
  touristName: string;
  email: string;
  phone: string;
  tripDetails: string;
  status: string;
  validFrom: string;
  validUntil: string;
  generatedAt: string;
}

interface Order {
  id: number;
  totalMad: number;
  cartItems: string;
}

// Helper function to safely get string value from field that might be a translation object
const getStringValue = (field: any, locale: string = 'en'): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    return field[locale] || field.en || field.fr || field.es || field.it || '';
  }
  return String(field);
};

export default function BadgePage() {
  const params = useParams();
  const badgeCode = params.badgeCode as string;
  const locale = params.locale as string;

  const [badge, setBadge] = useState<Badge | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const response = await fetch(`/api/badges/${badgeCode}`);
        
        if (!response.ok) {
          throw new Error('Badge not found');
        }

        const data = await response.json();
        setBadge(data.badge);
        setOrder(data.order);

        // Generate QR code with full URL instead of just badge code
        const QRCode = (await import('qrcode')).default;
        const badgeUrl = `${window.location.origin}/${locale}/badge/${data.badge.badgeCode}`;
        const qrUrl = await QRCode.toDataURL(badgeUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });
        setQrCodeUrl(qrUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load badge');
        toast.error('Failed to load badge');
      } finally {
        setLoading(false);
      }
    };

    if (badgeCode) {
      fetchBadge();
    }
  }, [badgeCode, locale]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `diffa-badge-${badgeCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f7fb] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading your badge...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !badge) {
    return (
      <div className="min-h-screen bg-[#f0f7fb] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-32 px-4">
          <div className="text-center max-w-md">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold mb-2">Badge Not Found</h1>
            <p className="text-muted mb-6">
              {error || 'The badge you are looking for does not exist or has been removed.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isValid = badge.status === 'active' && new Date(badge.validUntil) > new Date();
  
  // Parse tripDetails - handle both array and object formats
  let excursions: any[] = [];
  try {
    const parsedDetails = JSON.parse(badge.tripDetails);
    // If it's already an array, use it directly
    // If it's an object with excursions property, use that
    excursions = Array.isArray(parsedDetails) ? parsedDetails : (parsedDetails.excursions || []);
  } catch (err) {
    console.error('Error parsing trip details:', err);
    excursions = [];
  }

  return (
    <div className="min-h-screen bg-[#f0f7fb] flex flex-col print:min-h-0 print:bg-white">
      <div className="print:hidden">
        <Header />
        {/* Dark gradient overlay behind header */}
        <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/50 to-transparent z-40 pointer-events-none" />
      </div>
      
      <main className="flex-1 pt-32 pb-16 px-4 print:pt-0 print:pb-0 print:px-0 print:flex-none">
        <div className="container max-w-4xl mx-auto print:max-w-full print:mx-0 print:container-none">
          {/* Header Section */}
          <div className="text-center mb-8 print:mb-4">
            <h1 className="text-4xl font-display font-bold mb-2 print:text-2xl">
              🎫 Your Digital Badge
            </h1>
            <p className="text-muted print:text-sm">
              Present this badge at arrival for quick verification
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-8 print:mb-4">
            {isValid ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-full font-semibold print:px-4 print:py-2 print:text-sm">
                <CheckCircle2 className="w-5 h-5 print:w-4 print:h-4" />
                Active & Valid
              </div>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-800 rounded-full font-semibold print:px-4 print:py-2 print:text-sm">
                <XCircle className="w-5 h-5 print:w-4 print:h-4" />
                {badge.status === 'revoked' ? 'Revoked' : 'Expired'}
              </div>
            )}
          </div>

          {/* Main Badge Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border-2 border-primary/20 mb-8 print:shadow-none print:border print:border-gray-300 print:mb-0 print:rounded-none">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-primary to-accent p-6 text-white print:p-4 print:bg-primary print:text-black">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold print:text-xl">Diffa Tours</h2>
                  <p className="text-sm opacity-90 print:opacity-100">Tourist Badge</p>
                </div>
                <QrCode className="w-12 h-12 print:w-8 print:h-8" />
              </div>
            </div>

            {/* QR Code Section */}
            <div className="p-8 text-center bg-gray-50 print:p-4 print:bg-white">
              <div className="inline-block bg-white p-6 rounded-xl shadow-md print:p-3 print:shadow-none print:border print:border-gray-300 print:rounded-none">
                {qrCodeUrl && (
                  <img 
                    src={qrCodeUrl} 
                    alt="Badge QR Code" 
                    className="w-64 h-64 mx-auto print:w-48 print:h-48"
                  />
                )}
              </div>
              <div className="mt-4 print:mt-2">
                <p className="text-sm text-muted mb-2 print:text-xs print:text-gray-600">Badge Code</p>
                <p className="font-mono text-xl font-bold text-foreground tracking-wider print:text-base">
                  {badge.badgeCode}
                </p>
              </div>
            </div>

            {/* Tourist Information */}
            <div className="p-8 border-t-2 border-gray-200 print:p-4 print:border-t">
              <h3 className="text-lg font-display font-bold mb-4 text-primary print:text-base print:mb-2">
                Tourist Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
                <div className="flex items-start gap-3 print:gap-2">
                  <User className="w-5 h-5 text-primary mt-1 print:w-4 print:h-4" />
                  <div>
                    <p className="text-sm text-muted print:text-xs print:text-gray-600">Name</p>
                    <p className="font-semibold print:text-sm">{badge.touristName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 print:gap-2">
                  <Mail className="w-5 h-5 text-primary mt-1 print:w-4 print:h-4" />
                  <div>
                    <p className="text-sm text-muted print:text-xs print:text-gray-600">Email</p>
                    <p className="font-semibold break-all print:text-sm">{badge.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 print:gap-2">
                  <Phone className="w-5 h-5 text-primary mt-1 print:w-4 print:h-4" />
                  <div>
                    <p className="text-sm text-muted print:text-xs print:text-gray-600">Phone</p>
                    <p className="font-semibold print:text-sm">{badge.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 print:gap-2">
                  <Calendar className="w-5 h-5 text-primary mt-1 print:w-4 print:h-4" />
                  <div>
                    <p className="text-sm text-muted print:text-xs print:text-gray-600">Order Number</p>
                    <p className="font-semibold font-mono print:text-sm">{badge.orderNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="p-8 bg-gray-50 border-t-2 border-gray-200 print:p-4 print:bg-white print:border-t">
              <h3 className="text-lg font-display font-bold mb-4 text-primary flex items-center gap-2 print:text-base print:mb-2">
                <MapPin className="w-5 h-5 print:w-4 print:h-4" />
                Your Excursions
              </h3>
              <div className="space-y-3 print:space-y-2">
                {excursions.map((excursion: any, index: number) => {
                  const excursionName = getStringValue(excursion.excursionName || excursion.name, locale);
                  
                  return (
                    <div 
                      key={index}
                      className="bg-white p-4 rounded-lg border border-gray-200 print:p-2 print:rounded-none"
                    >
                      <h4 className="font-semibold text-foreground mb-2 print:text-sm print:mb-1">
                        {excursionName || 'Excursion'}
                      </h4>
                      <div className="text-sm text-muted space-y-1 print:text-xs print:text-gray-700">
                        <p>📅 Date: {new Date(excursion.date).toLocaleDateString(locale, { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                        {excursion.time && excursion.time !== 'N/A' && <p>⏰ Time: {excursion.time}</p>}
                        <p>
                          👥 Participants: {excursion.ageGroups?.adult || excursion.adults || 0} adult(s)
                          {(excursion.ageGroups?.['4-12'] || excursion.children || 0) > 0 && 
                            ` • ${excursion.ageGroups?.['4-12'] || excursion.children} child(ren)`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {order && (
                <div className="mt-4 p-4 bg-primary/10 rounded-lg print:mt-2 print:p-2 print:rounded-none print:bg-gray-100">
                  <p className="text-sm text-muted print:text-xs print:text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-primary print:text-lg">
                    {order.totalMad.toFixed(2)} MAD
                  </p>
                </div>
              )}
            </div>

            {/* Validity Period */}
            <div className="p-8 border-t-2 border-gray-200 print:p-4 print:border-t">
              <h3 className="text-lg font-display font-bold mb-4 text-primary print:text-base print:mb-2">
                Validity Period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
                <div>
                  <p className="text-sm text-muted mb-1 print:text-xs print:text-gray-600">Valid From</p>
                  <p className="font-semibold print:text-sm">
                    {new Date(badge.validFrom).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1 print:text-xs print:text-gray-600">Valid Until</p>
                  <p className="font-semibold print:text-sm">
                    {new Date(badge.validUntil).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 print:hidden">
            <Button
              onClick={handleDownload}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-5 h-5 mr-2" />
              Download QR Code
            </Button>
            <Button
              onClick={handlePrint}
              size="lg"
              variant="outline"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print Badge
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg print:hidden">
            <h3 className="font-display font-bold text-blue-900 mb-3">
              📱 How to Use Your Badge
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Save this page or take a screenshot of your QR code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Present the QR code to our staff upon arrival</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Staff will scan your code for instant verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>You can also print this badge for backup</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}