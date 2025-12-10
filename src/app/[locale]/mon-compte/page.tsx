'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/sections/header';
import { User, Mail, Phone, MapPin, Calendar, Settings, LogOut, BookOpen, Star, Clock, CheckCircle, XCircle, AlertCircle, Loader2, ShoppingBag, Bell, Package, Edit } from 'lucide-react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { useTranslations } from '@/lib/i18n/hooks';

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

interface Order {
  _id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cartItems: string;
  totalMad: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  accommodationType: string;
  hotelName?: string;
  createdAt: string;
}

interface Notification {
  _id: string;
  type: 'order_created' | 'order_confirmed' | 'order_rejected';
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  read: boolean;
  createdAt: string;
}

interface Review {
  id: number;
  excursionName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  excursionSlug: string;
  isVerified: boolean;
}

interface UserData {
  clerkId: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
}

export default function MonComptePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const { formatPrice } = useCurrency();
  const t = useTranslations();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'reservations' | 'notifications' | 'reviews'>('info');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push(`/${locale}/sign-in`);
    }
  }, [isLoaded, user, router, locale]);

  // Fetch data
  useEffect(() => {
    if (user?.id) {
      fetchUserData();
      fetchReservations();
      fetchOrders();
      fetchNotifications();
      fetchReviews();
    }
  }, [user?.id]);

  const fetchUserData = async () => {
    try {
      setIsLoadingUserData(true);
      const response = await fetch(`/api/users/${user?.id}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setUserData(result.data);
        setEditFormData({
          name: result.data.name || '',
          phone: result.data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setIsLoadingReservations(true);
      const response = await fetch(`/api/reservations/user/${user?.id}`);
      const result = await response.json();
      
      if (result.success) {
        setReservations(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error(t('account.reservations.loadingError'));
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const response = await fetch(`/api/orders?userClerkId=${user?.id}`);
      const result = await response.json();
      
      if (Array.isArray(result)) {
        setOrders(result);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await fetch('/api/notifications');
      const result = await response.json();
      
      if (result.notifications) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const response = await fetch(`/api/reviews/user/${user?.id}`);
      const result = await response.json();
      
      if (result.success) {
        setReviews(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error(t('account.reviews.loadingError'));
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone if provided
    if (editFormData.phone) {
      const phoneDigits = editFormData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 8) {
        toast.error('Le numéro de téléphone doit contenir au moins 8 chiffres');
        return;
      }
    }
    
    setIsUpdating(true);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
          name: editFormData.name,
          phone: editFormData.phone
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Erreur lors de la mise à jour');
        return;
      }

      setUserData(result);
      setIsEditDialogOpen(false);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });
      
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push(`/${locale}`);
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleOpenEditDialog = () => {
    setEditFormData({
      name: userData?.name || user?.fullName || '',
      phone: userData?.phone || ''
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'confirmed':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      confirmed: 'Confirmé',
      pending: 'En attente',
      completed: 'Terminé',
      cancelled: 'Annulé',
      paid: 'Payé',
    };
    return statusMap[status] || status;
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'order_created': return '🆕';
      case 'order_confirmed': return '✅';
      case 'order_rejected': return '❌';
      default: return '📢';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} j`;
    return date.toLocaleDateString(locale);
  };

  const ongoingReservations = reservations.filter(r => r.status === 'confirmed' || r.status === 'pending');
  const pastReservations = reservations.filter(r => r.status === 'completed' || r.status === 'cancelled');
  
  const ongoingOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'pending');
  const pastOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main 
        className="pt-28 sm:pt-32 md:pt-40 pb-8 sm:pb-12 md:pb-16 min-h-screen bg-background bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url(https://t3.ftcdn.net/jpg/09/27/94/24/360_F_927942465_j6MgO2enbUJ3IHfr2hn8ZxGfY1Dshi8p.jpg)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header - Responsive */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-white font-display font-light mb-2">{t('account.title')}</h1>
            <p className="text-muted text-white text-sm sm:text-base">{t('account.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Sidebar - Responsive */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[20px] shadow-lg p-4 sm:p-6 lg:sticky lg:top-28">
                <div className="flex flex-col items-center mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 overflow-hidden">
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                    )}
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl text-center mb-1">{user.fullName || user.firstName || 'User'}</h2>
                  <p className="text-muted text-xs sm:text-sm">{t('account.memberSince')} {new Date(user.createdAt || '').toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full transition-colors text-sm sm:text-base ${
                      activeTab === 'info' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">{t('account.tabs.personalInfo')}</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full transition-colors text-sm sm:text-base ${
                      activeTab === 'orders' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">Mes Commandes</span>
                    {orders.length > 0 && (
                      <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                        {orders.length}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full transition-colors text-sm sm:text-base ${
                      activeTab === 'reservations' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">{t('account.tabs.reservations')}</span>
                    {reservations.length > 0 && (
                      <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                        {reservations.length}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full transition-colors text-sm sm:text-base ${
                      activeTab === 'notifications' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">Notifications</span>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full transition-colors text-sm sm:text-base ${
                      activeTab === 'reviews' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">{t('account.tabs.reviews')}</span>
                    {reviews.length > 0 && (
                      <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                        {reviews.length}
                      </span>
                    )}
                  </button>
                  
                  <div className="border-t border-border my-2"></div>
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full hover:bg-destructive/10 text-destructive transition-colors text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">{t('account.buttons.signOut')}</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content - Responsive */}
            <div className="lg:col-span-2">
              {/* Personal Info Tab */}
              {activeTab === 'info' && (
                <>
                  <div className="bg-white rounded-[20px] shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <h3 className="font-display text-xl sm:text-2xl">{t('account.personalInfo.title')}</h3>
                      <button
                        onClick={handleOpenEditDialog}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Modifier le profil</span>
                      </button>
                    </div>
                    
                    {isLoadingUserData ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-border rounded-[20px]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-xs sm:text-sm text-muted mb-1 block">{t('account.personalInfo.fullName')}</label>
                            <p className="font-medium text-sm sm:text-base break-words">{userData?.name || user.fullName || user.firstName || t('account.personalInfo.notProvided')}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-border rounded-[20px]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-xs sm:text-sm text-muted mb-1 block">{t('account.personalInfo.email')}</label>
                            <p className="font-medium text-sm sm:text-base break-all">{user.primaryEmailAddress?.emailAddress || t('account.personalInfo.notProvided')}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-border rounded-[20px]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Phone className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-xs sm:text-sm text-muted mb-1 block">Numéro de téléphone</label>
                            <p className="font-medium text-sm sm:text-base break-words">{userData?.phone || t('account.personalInfo.notProvided')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats Card - Responsive */}
                  <div className="bg-gradient-to-br from-primary to-accent rounded-[20px] shadow-lg p-4 sm:p-6 md:p-8 text-white">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="font-display text-xl sm:text-2xl text-white">{t('account.activity.title')}</h3>
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <p className="text-white/80 text-xs sm:text-sm mb-1">Commandes</p>
                        <p className="text-3xl sm:text-4xl font-display font-bold">{orders.length}</p>
                      </div>
                      <div>
                        <p className="text-white/80 text-xs sm:text-sm mb-1">{t('account.activity.totalReservations')}</p>
                        <p className="text-3xl sm:text-4xl font-display font-bold">{reservations.length}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-white/80 text-xs sm:text-sm mb-1">{t('account.activity.publishedReviews')}</p>
                        <p className="text-3xl sm:text-4xl font-display font-bold">{reviews.length}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Orders Tab - Responsive */}
              {activeTab === 'orders' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-[20px] p-3 sm:p-4 mb-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">Qu'est-ce qu'une commande ?</h4>
                        <p className="text-xs sm:text-sm text-blue-700">Les commandes sont des achats groupés effectués via le panier (plusieurs excursions à la fois).</p>
                      </div>
                    </div>
                  </div>

                  {/* Ongoing Orders */}
                  {ongoingOrders.length > 0 && (
                    <div>
                      <h3 className="font-display text-2xl mb-4 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary" />
                        Commandes en cours
                      </h3>
                      <div className="space-y-4">
                        {ongoingOrders.map((order) => {
                          let items = [];
                          try {
                            items = typeof order.cartItems === 'string' ? JSON.parse(order.cartItems) : order.cartItems;
                          } catch (e) {
                            console.error('Failed to parse cartItems:', e);
                            items = [];
                          }
                          
                          return (
                            <div key={order._id} className="bg-white rounded-[20px] shadow-lg p-4 sm:p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="font-display text-xl mb-1">Commande #{order.orderNumber.substring(0, 8)}</h4>
                                  <p className="text-sm text-muted">{items.length} excursion(s) • {new Date(order.createdAt).toLocaleDateString(locale)}</p>
                                </div>
                                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  {getStatusLabel(order.status)}
                                </span>
                              </div>
                              
                              <div className="mb-4 space-y-2">
                                {items.map((item: any, idx: number) => {
                                  const itemName = item.excursionName || item.name || 'Excursion';
                                  const itemPrice = item.totalPrice || item.price || 0;
                                  const itemQuantity = item.quantity || 1;
                                  
                                  return (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-[20px]">
                                      <div className="flex items-center gap-3">
                                        <Package className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{itemName}</span>
                                        <span className="text-sm text-muted">x{itemQuantity}</span>
                                      </div>
                                      <span className="text-sm font-semibold text-primary">{formatPrice(itemPrice)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="text-sm text-muted">
                                  Méthode: <span className="font-medium text-foreground">{order.paymentMethod === 'cash' ? 'Espèces' : order.paymentMethod === 'cmi' ? 'Carte bancaire' : 'Virement'}</span>
                                </div>
                                <div className="text-2xl font-display font-bold text-primary">{formatPrice(order.totalMad)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Past Orders */}
                  {pastOrders.length > 0 && (
                    <div>
                      <h3 className="font-display text-2xl mb-4">Historique des commandes</h3>
                      <div className="space-y-4">
                        {pastOrders.map((order) => {
                          let items = [];
                          try {
                            items = typeof order.cartItems === 'string' ? JSON.parse(order.cartItems) : order.cartItems;
                          } catch (e) {
                            console.error('Failed to parse cartItems:', e);
                            items = [];
                          }
                          
                          return (
                            <div key={order._id} className="bg-white rounded-[20px] shadow-lg p-4 sm:p-6 opacity-75">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="font-display text-xl mb-1">Commande #{order.orderNumber.substring(0, 8)}</h4>
                                  <p className="text-sm text-muted">{items.length} excursion(s) • {new Date(order.createdAt).toLocaleDateString(locale)}</p>
                                </div>
                                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  {getStatusLabel(order.status)}
                                </span>
                              </div>
                              
                              <div className="mb-4 space-y-2">
                                {items.map((item: any, idx: number) => {
                                  const itemName = item.excursionName || item.name || 'Excursion';
                                  const itemPrice = item.totalPrice || item.price || 0;
                                  const itemQuantity = item.quantity || 1;
                                  
                                  return (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-[20px]">
                                      <div className="flex items-center gap-3">
                                        <Package className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{itemName}</span>
                                        <span className="text-sm text-muted">x{itemQuantity}</span>
                                      </div>
                                      <span className="text-sm font-semibold text-primary">{formatPrice(itemPrice)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="text-sm text-muted">Total</div>
                                <div className="text-2xl font-display font-bold text-primary">{formatPrice(order.totalMad)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isLoadingOrders && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}

                  {!isLoadingOrders && orders.length === 0 && (
                    <div className="bg-white rounded-[20px] shadow-lg p-8 sm:p-12 text-center">
                      <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-primary/30 mx-auto mb-4" />
                      <h3 className="font-display text-xl sm:text-2xl mb-2">Aucune commande</h3>
                      <p className="text-muted mb-4 sm:mb-6 text-sm sm:text-base">Vous n'avez pas encore passé de commande via le panier.</p>
                      <Link 
                        href={`/${locale}/nos-excursions`}
                        className="inline-block bg-primary text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors text-sm sm:text-base"
                      >
                        Découvrir nos excursions
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Reservations Tab */}
              {activeTab === 'reservations' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-[20px] p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Qu'est-ce qu'une réservation ?</h4>
                        <p className="text-sm text-blue-700">Les réservations sont des réservations directes d'une seule excursion (sans passer par le panier).</p>
                      </div>
                    </div>
                  </div>

                  {/* Ongoing Reservations */}
                  {ongoingReservations.length > 0 && (
                    <div>
                      <h3 className="font-display text-2xl mb-4 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary" />
                        {t('account.reservations.ongoing')}
                      </h3>
                      <div className="space-y-4">
                        {ongoingReservations.map((reservation) => (
                          <div key={reservation.id} className="bg-white rounded-[20px] shadow-lg p-4 sm:p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-display text-xl mb-1">{reservation.excursionName}</h4>
                                <p className="text-sm text-muted">{t('account.reservations.reservationNumber')} #{reservation.id}</p>
                              </div>
                              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                                {getStatusIcon(reservation.status)}
                                {getStatusLabel(reservation.status)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-sm">{reservation.destination}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-accent" />
                                <span className="text-sm">{new Date(reservation.reservationDate).toLocaleDateString(locale)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-sm">{reservation.reservationTime}</span>
                              </div>
                              <div className="text-sm font-semibold text-primary">
                                {formatPrice(reservation.totalPriceMad)}
                              </div>
                            </div>
                            <Link 
                              href={`/${locale}/excursion/${reservation.excursionSlug}`}
                              className="inline-block text-sm text-primary hover:underline rounded-full"
                            >
                              {t('account.reservations.viewDetails')} →
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Reservations */}
                  {pastReservations.length > 0 && (
                    <div>
                      <h3 className="font-display text-2xl mb-4">{t('account.reservations.history')}</h3>
                      <div className="space-y-4">
                        {pastReservations.map((reservation) => (
                          <div key={reservation.id} className="bg-white rounded-[20px] shadow-lg p-4 sm:p-6 opacity-75">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-display text-xl mb-1">{reservation.excursionName}</h4>
                                <p className="text-sm text-muted">{t('account.reservations.reservationNumber')} #{reservation.id}</p>
                              </div>
                              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                                {getStatusIcon(reservation.status)}
                                {getStatusLabel(reservation.status)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-sm">{reservation.destination}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-accent" />
                                <span className="text-sm">{new Date(reservation.reservationDate).toLocaleDateString(locale)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-sm">{reservation.reservationTime}</span>
                              </div>
                              <div className="text-sm font-semibold text-primary">
                                {formatPrice(reservation.totalPriceMad)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isLoadingReservations && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}

                  {!isLoadingReservations && reservations.length === 0 && (
                    <div className="bg-white rounded-[20px] shadow-lg p-12 text-center">
                      <BookOpen className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                      <h3 className="font-display text-2xl mb-2">{t('account.reservations.none')}</h3>
                      <p className="text-muted mb-6">{t('account.reservations.noneDescription')}</p>
                      <Link 
                        href={`/${locale}/nos-excursions`}
                        className="inline-block bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                      >
                        {t('account.reservations.viewExcursions')}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-2xl">Historique des notifications</h3>
                  </div>

                  {isLoadingNotifications && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}

                  {!isLoadingNotifications && notifications.length > 0 && (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div 
                          key={notification._id} 
                          className={`bg-white rounded-[20px] shadow-lg p-4 sm:p-6 ${!notification.read ? 'border-l-4 border-primary' : 'opacity-75'}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                <h4 className="font-semibold text-lg">{notification.title}</h4>
                                {!notification.read && (
                                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">Nouveau</span>
                                )}
                              </div>
                              <p className="text-muted mb-2">{notification.message}</p>
                              <p className="text-xs text-muted">{formatTimeAgo(notification.createdAt)}</p>
                            </div>
                            <div className="flex gap-2">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkNotificationRead(notification._id)}
                                  className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                                >
                                  Marquer lu
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notification._id)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isLoadingNotifications && notifications.length === 0 && (
                    <div className="bg-white rounded-[20px] shadow-lg p-12 text-center">
                      <Bell className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                      <h3 className="font-display text-2xl mb-2">Aucune notification</h3>
                      <p className="text-muted">Vous n'avez pas encore de notifications.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-2xl">{t('account.reviews.title')}</h3>
                  </div>

                  {isLoadingReviews && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}

                  {!isLoadingReviews && reviews.length > 0 && (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-[20px] shadow-lg p-4 sm:p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-display text-xl mb-1">{review.excursionName}</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                {review.isVerified && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    {t('account.reviews.verified')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted">{new Date(review.createdAt).toLocaleDateString(locale)}</p>
                          </div>
                          {review.title && <h5 className="font-semibold mb-2">{review.title}</h5>}
                          <p className="text-muted">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isLoadingReviews && reviews.length === 0 && (
                    <div className="bg-white rounded-[20px] shadow-lg p-12 text-center">
                      <Star className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                      <h3 className="font-display text-2xl mb-2">{t('account.reviews.none')}</h3>
                      <p className="text-muted mb-6">{t('account.reviews.noneDescription')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] shadow-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">Modifier le profil</h2>
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                type="button"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-semibold text-foreground mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  disabled={isUpdating}
                  className="w-full px-4 py-3 border border-input bg-white/90 backdrop-blur-sm text-foreground rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label htmlFor="edit-phone" className="block text-sm font-semibold text-foreground mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    const phoneRegex = /^[0-9\s+\-()]*$/;
                    if (phoneRegex.test(value)) {
                      setEditFormData({ ...editFormData, phone: value });
                    }
                  }}
                  disabled={isUpdating}
                  className="w-full px-4 py-3 border border-input bg-white/90 backdrop-blur-sm text-foreground rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="+212 6XX XXX XXX"
                />
                <p className="text-xs text-muted mt-1">Le numéro doit contenir au moins 8 chiffres</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 border border-border rounded-full font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}