'use client';

import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle, Download, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';

interface Reservation {
  id: number;
  excursionName: string;
  destination: string;
  reservationDate: string;
  reservationTime: string;
  adults: number;
  children: number;
  totalPriceMad: number;
  status: string;
  paymentStatus: string;
  bookingDate: string;
  excursionSlug: string;
}

export default function MesReservationsPage() {
  const { formatPrice } = useCurrency();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const [sendingInvoice, setSendingInvoice] = useState<string | null>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push(`/${locale}/sign-in`);
    }
  }, [isLoaded, user, router, locale]);

  // Fetch reservations
  useEffect(() => {
    if (user?.id) {
      fetchReservations();
    }
  }, [user?.id]);

  const fetchReservations = async () => {
    try {
      setIsLoadingReservations(true);
      const response = await fetch(`/api/reservations/user/${user?.id}`);
      const result = await response.json();
      
      if (result.success) {
        setReservations(result.data || []);
      } else {
        toast.error('Erreur lors du chargement des réservations');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const handleDownloadInvoice = async (reservationId: string) => {
    setDownloadingInvoice(reservationId);
    try {
      const response = await fetch(`/api/invoices/download/${reservationId}?locale=${locale}`);
      
      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${reservationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Facture téléchargée avec succès');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleSendInvoiceEmail = async (reservationId: string) => {
    setSendingInvoice(reservationId);
    try {
      const response = await fetch(`/api/invoices/email/${reservationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast.success('Facture envoyée par email avec succès');
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingInvoice(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <AlertCircle className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  // Filter reservations based on active filter
  const filteredReservations = reservations.filter(reservation => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') return reservation.status === 'confirmed' || reservation.status === 'pending';
    if (activeFilter === 'completed') return reservation.status === 'completed';
    if (activeFilter === 'cancelled') return reservation.status === 'cancelled';
    return true;
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Dark gradient overlay behind header */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/50 to-transparent z-40 pointer-events-none" />
      
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl text-white font-display font-light mb-2">Mes Réservations</h1>
              <p className="text-white">Gérez et consultez toutes vos réservations</p>
            </div>
            <Link 
              href={`/${locale}/nos-excursions`}
              className="hidden md:inline-block bg-primary text-primary-foreground px-6 py-3 rounded-[20px] font-semibold hover:bg-primary/90 transition-colors"
            >
              Nouvelle réservation
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-[20px] font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'all' ? 'bg-primary text-white' : 'bg-white text-foreground hover:bg-secondary'
              }`}
            >
              Toutes
            </button>
            <button 
              onClick={() => setActiveFilter('upcoming')}
              className={`px-4 py-2 rounded-[20px] font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'upcoming' ? 'bg-primary text-white' : 'bg-white text-foreground hover:bg-secondary'
              }`}
            >
              À venir
            </button>
            <button 
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-2 rounded-[20px] font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'completed' ? 'bg-primary text-white' : 'bg-white text-foreground hover:bg-secondary'
              }`}
            >
              Terminées
            </button>
            <button 
              onClick={() => setActiveFilter('cancelled')}
              className={`px-4 py-2 rounded-[20px] font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'cancelled' ? 'bg-primary text-white' : 'bg-white text-foreground hover:bg-secondary'
              }`}
            >
              Annulées
            </button>
          </div>

          {/* Loading State */}
          {isLoadingReservations && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Reservations List */}
          {!isLoadingReservations && filteredReservations.length > 0 && (
            <div className="space-y-6">
              {filteredReservations.map((reservation) => (
                <div 
                  key={reservation.id} 
                  className="bg-white rounded-[20px] shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-2xl">{reservation.excursionName}</h3>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          {getStatusLabel(reservation.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted">Réservation #{reservation.id} • Réservée le {new Date(reservation.bookingDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-display font-bold text-primary">{formatPrice(reservation.totalPriceMad)}</p>
                      <p className="text-sm text-muted">Total</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-[20px]">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted">Destination</p>
                        <p className="font-medium">{reservation.destination}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-[20px]">
                      <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted">Date</p>
                        <p className="font-medium">{new Date(reservation.reservationDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-[20px]">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted">Heure</p>
                        <p className="font-medium">{reservation.reservationTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-[20px]">
                      <Users className="w-5 h-5 text-accent flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted">Participants</p>
                        <p className="font-medium">{reservation.adults + reservation.children} {(reservation.adults + reservation.children) > 1 ? 'personnes' : 'personne'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Invoice Actions - Show for confirmed and completed reservations */}
                    {(reservation.status === 'confirmed' || reservation.status === 'completed') && (
                      <>
                        <button
                          onClick={() => handleDownloadInvoice(reservation.id.toString())}
                          disabled={downloadingInvoice === reservation.id.toString()}
                          className="px-6 py-3 bg-blue-600 text-white rounded-[20px] font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {downloadingInvoice === reservation.id.toString() ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Téléchargement...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Télécharger Facture
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleSendInvoiceEmail(reservation.id.toString())}
                          disabled={sendingInvoice === reservation.id.toString()}
                          className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-[20px] font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {sendingInvoice === reservation.id.toString() ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Envoyer par Email
                            </>
                          )}
                        </button>
                      </>
                    )}
                    
                    <Link
                      href={`/${locale}/excursion/${reservation.excursionSlug}`}
                      className="flex-1 px-6 py-3 bg-primary text-white rounded-[20px] font-semibold hover:bg-primary/90 transition-colors text-center"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoadingReservations && filteredReservations.length === 0 && (
            <div className="bg-white rounded-[20px] shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-primary" />
              </div>
              <h3 className="font-display text-2xl mb-3">
                {activeFilter === 'all' ? 'Aucune réservation' : `Aucune réservation ${activeFilter === 'upcoming' ? 'à venir' : activeFilter === 'completed' ? 'terminée' : 'annulée'}`}
              </h3>
              <p className="text-muted mb-6 max-w-md mx-auto">
                {activeFilter === 'all' 
                  ? "Vous n'avez pas encore de réservation. Découvrez nos excursions et circuits pour vivre une expérience inoubliable au Maroc."
                  : `Aucune réservation ${activeFilter === 'upcoming' ? 'à venir' : activeFilter === 'completed' ? 'terminée' : 'annulée'} pour le moment.`
                }
              </p>
              {activeFilter === 'all' && (
                <Link 
                  href={`/${locale}/nos-excursions`}
                  className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-[20px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  Découvrir nos excursions
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}