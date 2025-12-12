'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { useTranslations } from '@/lib/i18n/hooks';
import { Plus, Edit, Trash2, Loader2, X, Users, Briefcase, Map, Search, RefreshCw, Eye, EyeOff, Upload, Link as LinkIcon, ShoppingCart, Badge, CheckCircle, XCircle, Ban, QrCode, BarChart3, TrendingUp, DollarSign, Calendar as CalendarIcon, Clock, Mail } from 'lucide-react';
import Header from '@/components/sections/header';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper function to safely get string value from field that might be a translation object
const getStringValue = (field: any, locale: string = 'en'): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    return field[locale] || field.en || field.fr || field.es || field.it || '';
  }
  return String(field);
};

// Types
interface User {
  id: number;
  clerkId: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

interface Service {
  id: number;
  title: { en: string; fr: string; es: string; it: string; };
  description: { en: string; fr: string; es: string; it: string; };
  icon: string;
  order: number;
  active: boolean;
}

interface ExcursionItem {
  id: string;
  label: string;
  price: number;
  defaultChecked: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

type ExcursionSection = 'marrakech' | 'agadir' | 'taghazout' | 'circuits';

interface Excursion {
  _id: string;
  id: string;
  name: { en: string; fr: string; es: string; it: string; } | string;
  section: ExcursionSection;
  images: string[];
  priceMAD: number;
  location: { en: string; fr: string; es: string; it: string; } | string;
  duration: { en: string; fr: string; es: string; it: string; } | string;
  groupSize: string;
  rating: number;
  description: { en: string; fr: string; es: string; it: string; } | string;
  highlights: Array<{ en: string; fr: string; es: string; it: string; }> | string[];
  included: Array<{ en: string; fr: string; es: string; it: string; }> | string[];
  notIncluded: Array<{ en: string; fr: string; es: string; it: string; }> | string[];
  items?: ExcursionItem[];
  availableDays?: string[];
  timeSlots?: TimeSlot[];
  isAdultsOnly?: boolean;
}

interface ExcursionSetting {
  id: number;
  section: string;
  showPrice: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userClerkId?: string;
  firstName: string;
  lastName: string;
  email: string;
  totalMad: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

interface BadgeData {
  id: number;
  badge_code: string;
  order_number: string;
  tourist_name: string;
  tourist_email: string;
  trip_info: string;
  status: string;
  valid_until: string | null;
  created_at: string;
  scans_count: number;
}

// Analytics types
interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalReservations: number;
  pendingOrders: number;
  confirmedOrders: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  topExcursions: Array<{ name: string; bookings: number; revenue: number }>;
  revenueByPaymentMethod: Array<{ method: string; amount: number }>;
}

// Add these constants at the top level after imports, before the component
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AdminDashboard() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const t = useTranslations('admin');

  // Get current locale from URL
  const [currentLocale, setCurrentLocale] = useState('fr');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/');
      const locale = pathSegments[1] || 'fr';
      setCurrentLocale(locale);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('analytics');
  const [activeExcursionSection, setActiveExcursionSection] = useState<ExcursionSection>('marrakech');
  const [loading, setLoading] = useState(true);

  // Check if user is admin from Clerk's publicMetadata
  const isAdmin = clerkUser?.publicMetadata?.role === 'admin';

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', phone: '', role: 'user' });
  const [syncing, setSyncing] = useState(false);

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    titleEn: '', titleFr: '', titleEs: '', titleIt: '',
    descriptionEn: '', descriptionFr: '', descriptionEs: '', descriptionIt: '',
    icon: '', order: 0, active: true
  });

  // Excursions state
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [editingExcursion, setEditingExcursion] = useState<Excursion | null>(null);
  const [excursionDialogOpen, setExcursionDialogOpen] = useState(false);
  const [excursionFormData, setExcursionFormData] = useState({
    id: '',
    nameEn: '', nameFr: '', nameEs: '', nameIt: '',
    section: 'marrakech' as ExcursionSection,
    images: '',
    priceMAD: '',
    locationEn: '', locationFr: '', locationEs: '', locationIt: '',
    durationEn: '', durationFr: '', durationEs: '', durationIt: '',
    groupSize: '',
    rating: '0',
    descriptionEn: '', descriptionFr: '', descriptionEs: '', descriptionIt: '',
    highlightsEn: '', highlightsFr: '', highlightsEs: '', highlightsIt: '',
    includedEn: '', includedFr: '', includedEs: '', includedIt: '',
    notIncludedEn: '', notIncludedFr: '', notIncludedEs: '', notIncludedIt: '',
    isAdultsOnly: false
  });
  const [items, setItems] = useState<ExcursionItem[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>(['everyday']);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');

  // Excursion settings state
  const [excursionSettings, setExcursionSettings] = useState<ExcursionSetting[]>([]);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  const [saving, setSaving] = useState(false);

  // Orders/Reservations state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Badges state
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [badgeSearch, setBadgeSearch] = useState('');
  const [badgeStatusFilter, setBadgeStatusFilter] = useState<string>('all');

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      router.push('/sign-in');
      return;
    }

    // Check admin role from Clerk's publicMetadata
    if (clerkUser.publicMetadata?.role !== 'admin') {
      toast.error('Access denied. Admin role required.');
      router.push('/');
      return;
    }

    setLoading(false);
  }, [isLoaded, isSignedIn, clerkUser, router]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (userRoleFilter !== 'all') params.append('role', userRoleFilter);

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      } else {
        console.error('No users in response:', data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(t('error'));
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/services', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error(t('error'));
    }
  };

  // Fetch excursions
  const fetchExcursions = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/excursions', {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setExcursions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch excursions:', error);
      toast.error(t('error'));
    }
  };

  // Fetch excursion settings
  const fetchExcursionSettings = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/excursion-settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setExcursionSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch excursion settings:', error);
      toast.error('Failed to load excursion settings');
    }
  };

  // Update excursion setting
  const handleTogglePriceVisibility = async (section: string, currentValue: boolean) => {
    setUpdatingSettings(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/excursion-settings/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ showPrice: !currentValue })
      });

      if (response.ok) {
        toast.success(`Price visibility updated for ${section}`);
        fetchExcursionSettings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Update setting error:', error);
      toast.error('Failed to update setting');
    } finally {
      setUpdatingSettings(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (orderSearch) params.append('search', orderSearch);
      if (orderStatusFilter !== 'all') params.append('status', orderStatusFilter);

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    }
  };

  // Fetch badges
  const fetchBadges = async () => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (badgeSearch) params.append('search', badgeSearch);
      if (badgeStatusFilter !== 'all') params.append('status', badgeStatusFilter);

      const response = await fetch(`/api/badges?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.badges) {
        setBadges(data.badges);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
      toast.error('Failed to load badges');
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Order status updated');

        // If confirming order, send confirmation email with badge
        if (status === 'confirmed') {
          const emailResponse = await fetch(`/api/admin/orders/${orderId}/send-confirmation`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (emailResponse.ok) {
            toast.success('Confirmation email sent with badge!');
          } else {
            const errorData = await emailResponse.json();
            toast.error(errorData.error || 'Order confirmed but email failed to send');
          }
        }

        fetchOrders();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Update order error:', error);
      toast.error('Failed to update order');
    }
  };

  // Send confirmation email manually
  const handleSendConfirmationEmail = async (orderId: string) => {
    try {
      const token = await getToken();
      const emailResponse = await fetch(`/api/admin/orders/${orderId}/send-confirmation`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (emailResponse.ok) {
        toast.success('Confirmation email sent with badge!');
      } else {
        const errorData = await emailResponse.json();
        toast.error(errorData.error || 'Failed to send confirmation email');
      }
    } catch (error) {
      console.error('Send email error:', error);
      toast.error('Failed to send confirmation email');
    }
  };

  // Revoke badge
  const handleRevokeBadge = async (badgeCode: string) => {
    if (!confirm('Are you sure you want to revoke this badge?')) return;

    try {
      const token = await getToken();

      // Fetch current user info directly from API instead of relying on users state
      const userResponse = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        toast.error('Failed to fetch user information');
        return;
      }

      const userData = await userResponse.json();
      const currentUser = userData.users?.find((u: User) => u.clerkId === clerkUser?.id);

      if (!currentUser) {
        toast.error('User information not found');
        return;
      }

      const response = await fetch(`/api/badges/${badgeCode}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          revokedBy: currentUser.id,
          revokedReason: 'Revoked by administrator'
        }),
      });

      if (response.ok) {
        toast.success('Badge revoked successfully');
        fetchBadges();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to revoke badge');
      }
    } catch (error) {
      console.error('Revoke badge error:', error);
      toast.error('Failed to revoke badge');
    }
  };

  // Delete badge
  const handleDeleteBadge = async (badgeCode: string) => {
    if (!confirm('Are you sure you want to permanently delete this badge? This action cannot be undone.')) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/badges/${badgeCode}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Badge deleted successfully');
        fetchBadges();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete badge');
      }
    } catch (error) {
      console.error('Delete badge error:', error);
      toast.error('Failed to delete badge');
    }
  };

  // Assign staff role with sign-out reminder
  const handleAssignStaffRole = async (userId: number) => {
    if (!confirm('Assign staff role to this user?\n\nNote: The user will need to sign out and sign back in for the staff panel to appear.')) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/users/${userId}/assign-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: 'staff' }),
      });

      if (response.ok) {
        toast.success('Staff role assigned! User must sign out and sign back in to access staff panel.');
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign staff role');
      }
    } catch (error) {
      console.error('Assign role error:', error);
      toast.error('Failed to assign role');
    }
  };

  // View badge for order - FIX: Use current locale instead of hardcoded /fr
  const handleViewBadge = async (orderNumber: string) => {
    try {
      const token = await getToken();
      // First check if badge exists for this order
      const response = await fetch(`/api/badges?search=${orderNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const badge = data.badges?.find((b: any) => b.order_number === orderNumber);

      if (badge) {
        // Use current locale instead of hardcoded /fr
        const badgeUrl = `/${currentLocale}/badge/${badge.badge_code}`;
        window.open(badgeUrl, '_blank');
      } else {
        toast.error('No badge found for this order. Please confirm the order first to generate the badge.');
      }
    } catch (error) {
      console.error('Error finding badge:', error);
      toast.error('Failed to find badge');
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(t('orders.deleteConfirm'))) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success(t('orders.deleteSuccess'));
        fetchOrders();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t('error'));
      }
    } catch (error) {
      console.error('Delete order error:', error);
      toast.error(t('error'));
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (isAdmin && activeTab === 'users') fetchUsers();
  }, [isAdmin, activeTab, userSearch, userRoleFilter]);

  useEffect(() => {
    if (isAdmin && activeTab === 'orders') fetchOrders();
  }, [isAdmin, activeTab, orderSearch, orderStatusFilter]);

  useEffect(() => {
    if (isAdmin && activeTab === 'badges') fetchBadges();
  }, [isAdmin, activeTab, badgeSearch, badgeStatusFilter]);

  useEffect(() => {
    if (isAdmin && activeTab === 'services') fetchServices();
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (isAdmin && activeTab === 'excursions') {
      fetchExcursions();
      fetchExcursionSettings();
    }
  }, [isAdmin, activeTab]);

  // User handlers
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role
    });
    setUserDialogOpen(true);
  };

  const handleSyncUsers = async () => {
    setSyncing(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/sync-users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Users synced successfully!');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to sync users');
      }
    } catch (error) {
      console.error('Sync users error:', error);
      toast.error('Failed to sync users');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm(t('users.deleteConfirm'))) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success(t('users.deleteSuccess'));
        fetchUsers();
      } else {
        toast.error(t('error'));
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error(t('error'));
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userFormData)
      });

      if (response.ok) {
        toast.success(t('users.updateSuccess'));
        setUserDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(t('error'));
      }
    } catch (error) {
      console.error('Save user error:', error);
      toast.error(t('error'));
    } finally {
      setSaving(false);
    }
  };

  // Service handlers
  const handleCreateService = () => {
    setEditingService(null);
    setServiceFormData({
      titleEn: '', titleFr: '', titleEs: '', titleIt: '',
      descriptionEn: '', descriptionFr: '', descriptionEs: '', descriptionIt: '',
      icon: '', order: services.length, active: true
    });
    setServiceDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceFormData({
      titleEn: service.title.en,
      titleFr: service.title.fr,
      titleEs: service.title.es,
      titleIt: service.title.it,
      descriptionEn: service.description.en,
      descriptionFr: service.description.fr,
      descriptionEs: service.description.es,
      descriptionIt: service.description.it,
      icon: service.icon,
      order: service.order,
      active: service.active
    });
    setServiceDialogOpen(true);
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm(t('services.deleteConfirm'))) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success(t('services.deleteSuccess'));
        fetchServices();
      } else {
        toast.error(t('error'));
      }
    } catch (error) {
      console.error('Delete service error:', error);
      toast.error(t('error'));
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const payload = {
        title: {
          en: serviceFormData.titleEn,
          fr: serviceFormData.titleFr,
          es: serviceFormData.titleEs,
          it: serviceFormData.titleIt
        },
        description: {
          en: serviceFormData.descriptionEn,
          fr: serviceFormData.descriptionFr,
          es: serviceFormData.descriptionEs,
          it: serviceFormData.descriptionIt
        },
        icon: serviceFormData.icon,
        order: serviceFormData.order,
        active: serviceFormData.active
      };

      const url = editingService ? `/api/admin/services/${editingService.id}` : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editingService ? t('services.updateSuccess') : t('services.createSuccess'));
        setServiceDialogOpen(false);
        fetchServices();
      } else {
        toast.error(t('error'));
      }
    } catch (error) {
      console.error('Save service error:', error);
      toast.error(t('error'));
    } finally {
      setSaving(false);
    }
  };

  // Excursion handlers
  const handleCreateExcursion = (section: ExcursionSection) => {
    setEditingExcursion(null);
    setExcursionFormData({
      id: '',
      nameEn: '', nameFr: '', nameEs: '', nameIt: '',
      section: section,
      images: '',
      priceMAD: '',
      locationEn: '', locationFr: '', locationEs: '', locationIt: '',
      durationEn: '', durationFr: '', durationEs: '', durationIt: '',
      groupSize: '',
      rating: '0',
      descriptionEn: '', descriptionFr: '', descriptionEs: '', descriptionIt: '',
      highlightsEn: '', highlightsFr: '', highlightsEs: '', highlightsIt: '',
      includedEn: '', includedFr: '', includedEs: '', includedIt: '',
      notIncludedEn: '', notIncludedFr: '', notIncludedEs: '', notIncludedIt: '',
      isAdultsOnly: false
    });
    setItems([{ id: 'standard', label: 'Standard Tour', price: 0, defaultChecked: true }]);
    setAvailableDays(['everyday']);
    setTimeSlots([]);
    setExcursionDialogOpen(true);
  };

  const handleEditExcursion = (excursion: Excursion) => {
    setEditingExcursion(excursion);

    // Helper to extract text from multi-language or string format
    const getText = (field: any, lang: 'en' | 'fr' | 'es' | 'it') => {
      if (typeof field === 'string') return lang === 'en' ? field : '';
      return field?.[lang] || '';
    };

    // Helper for arrays
    const getArrayText = (field: any, lang: 'en' | 'fr' | 'es' | 'it') => {
      if (Array.isArray(field)) {
        if (field.length === 0) return '';
        if (typeof field[0] === 'string') return lang === 'en' ? field.join(', ') : '';
        return field.map(item => item[lang] || '').filter(Boolean).join(', ');
      }
      return '';
    };

    setExcursionFormData({
      id: excursion.id,
      nameEn: getText(excursion.name, 'en'),
      nameFr: getText(excursion.name, 'fr'),
      nameEs: getText(excursion.name, 'es'),
      nameIt: getText(excursion.name, 'it'),
      section: excursion.section,
      images: excursion.images.join(', '),
      priceMAD: excursion.priceMAD.toString(),
      locationEn: getText(excursion.location, 'en'),
      locationFr: getText(excursion.location, 'fr'),
      locationEs: getText(excursion.location, 'es'),
      locationIt: getText(excursion.location, 'it'),
      durationEn: getText(excursion.duration, 'en'),
      durationFr: getText(excursion.duration, 'fr'),
      durationEs: getText(excursion.duration, 'es'),
      durationIt: getText(excursion.duration, 'it'),
      groupSize: excursion.groupSize,
      rating: excursion.rating.toString(),
      descriptionEn: getText(excursion.description, 'en'),
      descriptionFr: getText(excursion.description, 'fr'),
      descriptionEs: getText(excursion.description, 'es'),
      descriptionIt: getText(excursion.description, 'it'),
      highlightsEn: getArrayText(excursion.highlights, 'en'),
      highlightsFr: getArrayText(excursion.highlights, 'fr'),
      highlightsEs: getArrayText(excursion.highlights, 'es'),
      highlightsIt: getArrayText(excursion.highlights, 'it'),
      includedEn: getArrayText(excursion.included, 'en'),
      includedFr: getArrayText(excursion.included, 'fr'),
      includedEs: getArrayText(excursion.included, 'es'),
      includedIt: getArrayText(excursion.included, 'it'),
      notIncludedEn: getArrayText(excursion.notIncluded, 'en'),
      notIncludedFr: getArrayText(excursion.notIncluded, 'fr'),
      notIncludedEs: getArrayText(excursion.notIncluded, 'es'),
      notIncludedIt: getArrayText(excursion.notIncluded, 'it'),
      isAdultsOnly: excursion.isAdultsOnly || false
    });
    setItems(excursion.items || [{ id: 'standard', label: 'Standard Tour', price: excursion.priceMAD, defaultChecked: true }]);
    setAvailableDays(excursion.availableDays || ['everyday']);
    setTimeSlots(excursion.timeSlots || []);
    setExcursionDialogOpen(true);
  };

  const handleDeleteExcursion = async (id: string) => {
    if (!confirm(t('excursions.deleteConfirm'))) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/excursions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success(t('excursions.deleteSuccess'));
        fetchExcursions();
      } else {
        toast.error(t('error'));
      }
    } catch (error) {
      console.error('Delete excursion error:', error);
      toast.error(t('error'));
    }
  };

  const handleSaveExcursion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();

      // Helper to split comma-separated strings into arrays
      const splitToArray = (str: string) => str.split(',').map((item) => item.trim()).filter(item => item);

      // Construct multi-language arrays
      const highlightsArray = splitToArray(excursionFormData.highlightsEn).map((_, index) => ({
        en: splitToArray(excursionFormData.highlightsEn)[index] || '',
        fr: splitToArray(excursionFormData.highlightsFr)[index] || '',
        es: splitToArray(excursionFormData.highlightsEs)[index] || '',
        it: splitToArray(excursionFormData.highlightsIt)[index] || ''
      }));

      const includedArray = splitToArray(excursionFormData.includedEn).map((_, index) => ({
        en: splitToArray(excursionFormData.includedEn)[index] || '',
        fr: splitToArray(excursionFormData.includedFr)[index] || '',
        es: splitToArray(excursionFormData.includedEs)[index] || '',
        it: splitToArray(excursionFormData.includedIt)[index] || ''
      }));

      const notIncludedArray = splitToArray(excursionFormData.notIncludedEn).map((_, index) => ({
        en: splitToArray(excursionFormData.notIncludedEn)[index] || '',
        fr: splitToArray(excursionFormData.notIncludedFr)[index] || '',
        es: splitToArray(excursionFormData.notIncludedEs)[index] || '',
        it: splitToArray(excursionFormData.notIncludedIt)[index] || ''
      }));

      const payload = {
        id: excursionFormData.id,
        name: {
          en: excursionFormData.nameEn,
          fr: excursionFormData.nameFr,
          es: excursionFormData.nameEs,
          it: excursionFormData.nameIt
        },
        section: excursionFormData.section,
        images: excursionFormData.images.split(',').map((img) => img.trim()).filter(img => img),
        priceMAD: parseFloat(excursionFormData.priceMAD),
        location: {
          en: excursionFormData.locationEn,
          fr: excursionFormData.locationFr,
          es: excursionFormData.locationEs,
          it: excursionFormData.locationIt
        },
        duration: {
          en: excursionFormData.durationEn,
          fr: excursionFormData.durationFr,
          es: excursionFormData.durationEs,
          it: excursionFormData.durationIt
        },
        groupSize: excursionFormData.groupSize,
        rating: parseFloat(excursionFormData.rating),
        description: {
          en: excursionFormData.descriptionEn,
          fr: excursionFormData.descriptionFr,
          es: excursionFormData.descriptionEs,
          it: excursionFormData.descriptionIt
        },
        highlights: highlightsArray,
        included: includedArray,
        notIncluded: notIncludedArray,
        items: items,
        ageGroups: true,
        isAdultsOnly: excursionFormData.isAdultsOnly,
        availableDays: availableDays,
        timeSlots: timeSlots
      };

      const url = editingExcursion ? `/api/admin/excursions/${editingExcursion._id}` : '/api/admin/excursions';
      const method = editingExcursion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editingExcursion ? t('excursions.updateSuccess') : t('excursions.createSuccess'));
        setExcursionDialogOpen(false);
        fetchExcursions();
      } else {
        const data = await response.json();
        toast.error(data.error || t('error'));
      }
    } catch (error) {
      console.error('Save excursion error:', error);
      toast.error(t('error'));
    } finally {
      setSaving(false);
    }
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const token = await getToken();
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          const error = await response.json();
          toast.error(error.error || `Failed to upload ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        // Add uploaded URLs to existing images
        const existingImages = excursionFormData.images
          ? excursionFormData.images.split(',').map(img => img.trim()).filter(img => img)
          : [];
        const allImages = [...existingImages, ...uploadedUrls];
        setExcursionFormData({
          ...excursionFormData,
          images: allImages.join(', ')
        });
        toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImage(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Remove individual image from list
  const handleRemoveImage = (imageUrl: string) => {
    const images = excursionFormData.images
      .split(',')
      .map(img => img.trim())
      .filter(img => img && img !== imageUrl);
    setExcursionFormData({
      ...excursionFormData,
      images: images.join(', ')
    });
  };

  // Excursion item handlers
  const handleAddItem = () => {
    setItems([...items, { id: `item-${Date.now()}`, label: '', price: 0, defaultChecked: false }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ExcursionItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Filter excursions by active section
  const filteredExcursions = excursions.filter((exc) => exc.section === activeExcursionSection);

  // Get setting for current section
  const getCurrentSectionSetting = (section: ExcursionSection) => {
    return excursionSettings.find((s) => s.section === section);
  };

  const COLORS = ['#FFB73F', '#70CFF1', '#1e3a5f', '#f1c40f', '#e74c3c'];

  // Add day toggle handler
  const handleToggleDay = (day: string) => {
    if (day === 'everyday') {
      setAvailableDays(['everyday']);
    } else {
      // Remove 'everyday' if selecting specific days
      const filtered = availableDays.filter(d => d !== 'everyday');

      if (filtered.includes(day)) {
        // Remove the day if already selected
        const newDays = filtered.filter(d => d !== day);
        setAvailableDays(newDays.length === 0 ? ['everyday'] : newDays);
      } else {
        // Add the day
        setAvailableDays([...filtered, day]);
      }
    }
  };

  // Add time slot handlers
  const handleAddTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: '09:00', endTime: '17:00' }]);
  };

  const handleRemoveTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleTimeSlotChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSlots = [...timeSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setTimeSlots(newSlots);
  };

  // Helper function to format available days for display
  const formatAvailableDays = (days?: string[]) => {
    if (!days || days.length === 0 || days.includes('everyday')) {
      return 'Every Day';
    }
    return days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
  };

  // Helper function to format time slots for display
  const formatTimeSlots = (slots?: TimeSlot[]) => {
    if (!slots || slots.length === 0) {
      return 'All day';
    }
    return slots.map(slot => `${slot.startTime}-${slot.endTime}`).join(', ');
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-background flex flex-col section-overlay"
      style={{
        backgroundImage: 'url(https://www.shutterstock.com/image-vector/red-cyber-security-protection-data-600nw-2646525677.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Header />
      <main className="flex-1 pt-40 pb-8 px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-white">{t('title')}</h1>
            <p className="text-white/90 mt-2">{t('subtitle')}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-full">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 rounded-full">
                <Users className="w-4 h-4" />
                {t('tabs.users')}
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 rounded-full">
                <ShoppingCart className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex items-center gap-2 rounded-full">
                <Badge className="w-4 h-4" />
                Badges
              </TabsTrigger>
              <TabsTrigger value="excursions" className="flex items-center gap-2 rounded-full">
                <Map className="w-4 h-4" />
                {t('tabs.excursions')}
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-[20px] shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <h3 className="text-sm font-medium text-muted mb-1">Total Revenue</h3>
                      <p className="text-3xl font-display font-bold text-foreground">
                        {analytics.totalRevenue.toLocaleString()} MAD
                      </p>
                    </div>

                    <div className="bg-white rounded-[20px] shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-accent" />
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-muted mb-1">Total Orders</h3>
                      <p className="text-3xl font-display font-bold text-foreground">
                        {analytics.totalOrders}
                      </p>
                    </div>

                    <div className="bg-white rounded-[20px] shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-muted mb-1">Confirmed Orders</h3>
                      <p className="text-3xl font-display font-bold text-foreground">
                        {analytics.confirmedOrders}
                      </p>
                    </div>

                    <div className="bg-white rounded-[20px] shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-muted mb-1">Pending Orders</h3>
                      <p className="text-3xl font-display font-bold text-foreground">
                        {analytics.pendingOrders}
                      </p>
                    </div>
                  </div>

                  {/* Revenue Over Time */}
                  <div className="bg-white rounded-[20px] shadow-lg p-6">
                    <h3 className="text-xl font-display font-semibold mb-6">Revenue Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#FFB73F" strokeWidth={2} name="Revenue (MAD)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Orders by Status & Revenue by Payment Method */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[20px] shadow-lg p-6">
                      <h3 className="text-xl font-display font-semibold mb-6">Orders by Status</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics.ordersByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }: any) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="status"
                          >
                            {analytics.ordersByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-[20px] shadow-lg p-6">
                      <h3 className="text-xl font-display font-semibold mb-6">Revenue by Payment Method</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.revenueByPaymentMethod}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="method" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="amount" fill="#70CFF1" name="Revenue (MAD)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Excursions */}
                  <div className="bg-white rounded-[20px] shadow-lg p-6">
                    <h3 className="text-xl font-display font-semibold mb-6">Top Excursions</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Excursion Name</TableHead>
                          <TableHead className="text-center">Total Bookings</TableHead>
                          <TableHead className="text-right">Total Revenue (MAD)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.topExcursions.map((excursion, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{getStringValue(excursion.name, currentLocale)}</TableCell>
                            <TableCell className="text-center">{excursion.bookings}</TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              {excursion.revenue.toLocaleString()} MAD
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[20px] shadow-lg p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-display font-semibold mb-2">No Analytics Data</h3>
                  <p className="text-muted">Analytics data will appear once you have orders and bookings.</p>
                </div>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="bg-white rounded-[20px] shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-semibold">{t('users.title')}</h2>
                  <Button
                    onClick={handleSyncUsers}
                    disabled={syncing}
                    variant="outline"
                    className="gap-2 rounded-full"
                  >
                    {syncing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Sync Clerk Users
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      placeholder={t('users.searchPlaceholder')}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 rounded-full" />

                  </div>
                  <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                    <SelectTrigger className="w-48 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('users.filter.all')}</SelectItem>
                      <SelectItem value="admin">{t('users.filter.admin')}</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="user">{t('users.filter.user')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('users.table.name')}</TableHead>
                      <TableHead>{t('users.table.email')}</TableHead>
                      <TableHead>{t('users.table.phone')}</TableHead>
                      <TableHead>{t('users.table.role')}</TableHead>
                      <TableHead>{t('users.table.createdAt')}</TableHead>
                      <TableHead className="text-right">{t('users.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted">
                          {t('users.noUsers')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name || '-'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-primary/20 text-primary' :
                              user.role === 'staff' ? 'bg-accent/20 text-accent' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                              {user.role.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {user.role === 'user' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAssignStaffRole(user.id)}
                                  title="Assign Staff Role"
                                  className="rounded-full"
                                >
                                  <Badge className="w-4 h-4 text-accent" />
                                </Button>
                              )}
                              <Button variant="outline" size="sm" onClick={() => handleEditUser(user)} className="rounded-full">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.clerkId === clerkUser?.id}
                                className="rounded-full"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="bg-white rounded-[20px] shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-semibold">Orders & Reservations</h2>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      placeholder="Search by order number or customer..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-10 rounded-full"
                    />
                  </div>
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-48 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-mono font-medium">{order.orderNumber || '-'}</TableCell>
                          <TableCell>
                            {order.firstName && order.lastName
                              ? `${order.firstName} ${order.lastName}`
                              : order.email || order.userClerkId || '-'}
                          </TableCell>
                          <TableCell>
                            {(order.totalMad ?? 0).toFixed(2)} MAD
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                              order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                              {(order.paymentMethod || 'UNKNOWN').toUpperCase()} - {(order.paymentStatus || 'UNKNOWN').toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                              {(order.status || 'PENDING').toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Invalid Date'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewBadge(order.orderNumber)}
                                title="View QR Code Badge"
                                className="rounded-full"
                              >
                                <QrCode className="w-4 h-4 text-primary" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendConfirmationEmail(order._id)}
                                title="Send Confirmation Email"
                                className="rounded-full"
                              >
                                <Mail className="w-4 h-4 text-blue-600" />
                              </Button>
                              {order.status === 'pending' && order.paymentMethod === 'cash' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}
                                    title="Confirm Order"
                                    className="rounded-full"
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                                    title="Reject Order"
                                    className="rounded-full"
                                  >
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteOrder(order._id)}
                                title="Delete Order"
                                className="rounded-full"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges">
              <div className="bg-white rounded-[20px] shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-semibold">E-Badges Management</h2>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      placeholder="Search by badge code or tourist name..."
                      value={badgeSearch}
                      onChange={(e) => setBadgeSearch(e.target.value)}
                      className="pl-10 rounded-full"
                    />
                  </div>
                  <Select value={badgeStatusFilter} onValueChange={setBadgeStatusFilter}>
                    <SelectTrigger className="w-48 rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="revoked">Revoked</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Badge Code</TableHead>
                      <TableHead>Tourist Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Order #</TableHead>
                      <TableHead>Scans</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {badges.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted">
                          No badges found
                        </TableCell>
                      </TableRow>
                    ) : (
                      badges.map((badge) => (
                        <TableRow key={badge.id}>
                          <TableCell className="font-mono font-medium">{badge.badge_code}</TableCell>
                          <TableCell>{badge.tourist_name}</TableCell>
                          <TableCell>{badge.tourist_email}</TableCell>
                          <TableCell className="font-mono">{badge.order_number}</TableCell>
                          <TableCell>{badge.scans_count}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.status === 'active' ? 'bg-green-100 text-green-700' :
                              badge.status === 'revoked' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                              {(badge.status || 'unknown').toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            {badge.valid_until ? new Date(badge.valid_until).toLocaleDateString() : 'No expiration'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {badge.status === 'active' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRevokeBadge(badge.badge_code)}
                                  title="Revoke Badge"
                                  className="rounded-full"
                                >
                                  <Ban className="w-4 h-4 text-destructive" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBadge(badge.badge_code)}
                                title="Delete Badge"
                                className="rounded-full"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Excursions Tab */}
            <TabsContent value="excursions">
              <div className="space-y-6">
                {/* Price Visibility Controls */}
                <div className="bg-white rounded-[20px] shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Price Visibility Settings</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(['marrakech', 'agadir', 'taghazout'] as ExcursionSection[]).map((section) => {
                      const setting = getCurrentSectionSetting(section);
                      const isVisible = setting?.showPrice ?? true;

                      return (
                        <div key={section} className="flex items-center justify-between p-4 border border-border rounded-[20px]">
                          <div className="flex items-center gap-3">
                            {isVisible ? (
                              <Eye className="w-5 h-5 text-primary" />
                            ) : (
                              <EyeOff className="w-5 h-5 text-muted" />
                            )}
                            <div>
                              <p className="font-medium capitalize">{section}</p>
                              <p className="text-xs text-muted">
                                {isVisible ? 'Prices visible' : 'Prices hidden'}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={isVisible}
                            onCheckedChange={() => handleTogglePriceVisibility(section, isVisible)}
                            disabled={updatingSettings}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Excursion Sections */}
                <div className="bg-white rounded-[20px] shadow">
                  <Tabs value={activeExcursionSection} onValueChange={(val) => setActiveExcursionSection(val as ExcursionSection)}>
                    <div className="border-b border-border px-6 pt-6">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="marrakech" className="rounded-full">Marrakech</TabsTrigger>
                        <TabsTrigger value="agadir" className="rounded-full">Agadir</TabsTrigger>
                        <TabsTrigger value="taghazout" className="rounded-full">Taghazout</TabsTrigger>
                      </TabsList>
                    </div>

                    {(['marrakech', 'agadir', 'taghazout'] as ExcursionSection[]).map((section) => (
                      <TabsContent key={section} value={section} className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-semibold capitalize">{section} Excursions</h3>
                          <Button onClick={() => handleCreateExcursion(section)} className="bg-primary hover:bg-primary/90 rounded-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add {section} Excursion
                          </Button>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Available Days</TableHead>
                              <TableHead>Time Slots</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredExcursions.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted">
                                  No excursions found for {section}
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredExcursions.map((excursion) => (
                                <TableRow key={excursion._id}>
                                  <TableCell className="font-mono text-sm">{excursion.id}</TableCell>
                                  <TableCell className="font-medium">{getStringValue(excursion.name, currentLocale)}</TableCell>
                                  <TableCell>{getStringValue(excursion.location, currentLocale)}</TableCell>
                                  <TableCell>{excursion.priceMAD} MAD</TableCell>
                                  <TableCell>
                                    <span className="text-sm">
                                      {formatAvailableDays(excursion.availableDays)}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-muted">
                                      {formatTimeSlots(excursion.timeSlots)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button variant="outline" size="sm" onClick={() => handleEditExcursion(excursion)} className="rounded-full">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => handleDeleteExcursion(excursion._id)} className="rounded-full">
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* User Edit Dialog */}
          <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
            <DialogContent className="rounded-[20px]">
              <DialogHeader>
                <DialogTitle>{t('dialog.editUser')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('form.name')}</Label>
                  <Input
                    id="name"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    className="rounded-full" />

                </div>
                <div>
                  <Label htmlFor="email">{t('form.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    required
                    className="rounded-full" />

                </div>
                <div>
                  <Label htmlFor="phone">{t('form.phone')}</Label>
                  <Input
                    id="phone"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    className="rounded-full" />

                </div>
                <div>
                  <Label htmlFor="role">{t('form.role')}</Label>
                  <Select value={userFormData.role} onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{t('users.role.user')}</SelectItem>
                      <SelectItem value="admin">{t('users.role.admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setUserDialogOpen(false)} disabled={saving} className="rounded-full">
                    {t('dialog.cancel')}
                  </Button>
                  <Button type="submit" disabled={saving} className="rounded-full">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('dialog.saving')}</> : t('dialog.save')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Service Dialog */}
          <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[20px]">
              <DialogHeader>
                <DialogTitle>{editingService ? t('dialog.editService') : t('dialog.createService')}</DialogTitle>
                <DialogDescription>
                  {t('form.required')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveService} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('form.titleEn')}</Label>
                    <Input value={serviceFormData.titleEn} onChange={(e) => setServiceFormData({ ...serviceFormData, titleEn: e.target.value })} required className="rounded-full" />
                  </div>
                  <div>
                    <Label>{t('form.titleFr')}</Label>
                    <Input value={serviceFormData.titleFr} onChange={(e) => setServiceFormData({ ...serviceFormData, titleFr: e.target.value })} required className="rounded-full" />
                  </div>
                  <div>
                    <Label>{t('form.titleEs')}</Label>
                    <Input value={serviceFormData.titleEs} onChange={(e) => setServiceFormData({ ...serviceFormData, titleEs: e.target.value })} required className="rounded-full" />
                  </div>
                  <div>
                    <Label>{t('form.titleIt')}</Label>
                    <Input value={serviceFormData.titleIt} onChange={(e) => setServiceFormData({ ...serviceFormData, titleIt: e.target.value })} required className="rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('form.descriptionEn')}</Label>
                    <Textarea value={serviceFormData.descriptionEn} onChange={(e) => setServiceFormData({ ...serviceFormData, descriptionEn: e.target.value })} required rows={3} className="rounded-[20px]" />
                  </div>
                  <div>
                    <Label>{t('form.descriptionFr')}</Label>
                    <Textarea value={serviceFormData.descriptionFr} onChange={(e) => setServiceFormData({ ...serviceFormData, descriptionFr: e.target.value })} required rows={3} className="rounded-[20px]" />
                  </div>
                  <div>
                    <Label>{t('form.descriptionEs')}</Label>
                    <Textarea value={serviceFormData.descriptionEs} onChange={(e) => setServiceFormData({ ...serviceFormData, descriptionEs: e.target.value })} required rows={3} className="rounded-[20px]" />
                  </div>
                  <div>
                    <Label>{t('form.descriptionIt')}</Label>
                    <Textarea value={serviceFormData.descriptionIt} onChange={(e) => setServiceFormData({ ...serviceFormData, descriptionIt: e.target.value })} required rows={3} className="rounded-[20px]" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>{t('form.icon')}</Label>
                    <Input value={serviceFormData.icon} onChange={(e) => setServiceFormData({ ...serviceFormData, icon: e.target.value })} required placeholder="Car" className="rounded-full" />
                  </div>
                  <div>
                    <Label>{t('form.order')}</Label>
                    <Input type="number" value={serviceFormData.order} onChange={(e) => setServiceFormData({ ...serviceFormData, order: parseInt(e.target.value) })} required className="rounded-full" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceFormData.active}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, active: e.target.checked })}
                        className="w-4 h-4" />

                      <span>{t('form.active')}</span>
                    </label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setServiceDialogOpen(false)} disabled={saving} className="rounded-full">
                    {t('dialog.cancel')}
                  </Button>
                  <Button type="submit" disabled={saving} className="rounded-full">
                    {saving ?
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingService ? t('dialog.saving') : t('dialog.creating')}</> :

                      editingService ? t('dialog.save') : t('dialog.create')
                    }
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Excursion Dialog */}
          <Dialog open={excursionDialogOpen} onOpenChange={setExcursionDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[20px]">
              <DialogHeader>
                <DialogTitle>{editingExcursion ? t('dialog.editExcursion') : t('dialog.createExcursion')}</DialogTitle>
                <DialogDescription>
                  Fill in the details for the excursion in all languages.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveExcursion} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="id">Excursion ID *</Label>
                    <Input
                      id="id"
                      value={excursionFormData.id}
                      onChange={(e) => setExcursionFormData({ ...excursionFormData, id: e.target.value })}
                      placeholder="e.g., essaouira-taghazout"
                      required
                      disabled={!!editingExcursion}
                      className="rounded-full" />
                  </div>
                  <div>
                    <Label htmlFor="section">{t('form.section')} *</Label>
                    <Select
                      value={excursionFormData.section}
                      onValueChange={(value: ExcursionSection) => setExcursionFormData({ ...excursionFormData, section: value })}>
                      <SelectTrigger className="rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marrakech">{t('excursions.sections.marrakech')}</SelectItem>
                        <SelectItem value="agadir">{t('excursions.sections.agadir')}</SelectItem>
                        <SelectItem value="taghazout">{t('excursions.sections.taghazout')}</SelectItem>
                        <SelectItem value="circuits">{t('excursions.sections.circuits')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Multi-language Fields */}
                <div className="border rounded-[20px] p-4">
                  <Tabs defaultValue="en" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                      <TabsTrigger value="en" className="rounded-full">English</TabsTrigger>
                      <TabsTrigger value="fr" className="rounded-full">Français</TabsTrigger>
                      <TabsTrigger value="es" className="rounded-full">Español</TabsTrigger>
                      <TabsTrigger value="it" className="rounded-full">Italiano</TabsTrigger>
                    </TabsList>

                    {/* English Tab */}
                    <TabsContent value="en" className="space-y-4">
                      <div>
                        <Label>Name (English) *</Label>
                        <Input
                          value={excursionFormData.nameEn}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, nameEn: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Location (English) *</Label>
                        <Input
                          value={excursionFormData.locationEn}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, locationEn: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Duration (English) *</Label>
                        <Input
                          value={excursionFormData.durationEn}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, durationEn: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Description (English) *</Label>
                        <Textarea
                          value={excursionFormData.descriptionEn}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, descriptionEn: e.target.value })}
                          rows={3}
                          required
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>Highlights (comma-separated, English)</Label>
                        <Textarea
                          value={excursionFormData.highlightsEn}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, highlightsEn: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>What's Included (comma-separated, English)</Label>
                        <Textarea
                          value={excursionFormData.includedEn}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, includedEn: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>Not Included (comma-separated, English)</Label>
                        <Textarea
                          value={excursionFormData.notIncludedEn}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, notIncludedEn: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                    </TabsContent>

                    {/* French Tab */}
                    <TabsContent value="fr" className="space-y-4">
                      <div>
                        <Label>Name (Français) *</Label>
                        <Input
                          value={excursionFormData.nameFr}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, nameFr: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Location (Français) *</Label>
                        <Input
                          value={excursionFormData.locationFr}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, locationFr: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Duration (Français) *</Label>
                        <Input
                          value={excursionFormData.durationFr}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, durationFr: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Description (Français) *</Label>
                        <Textarea
                          value={excursionFormData.descriptionFr}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, descriptionFr: e.target.value })}
                          rows={3}
                          required
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>Highlights (séparés par virgule, Français)</Label>
                        <Textarea
                          value={excursionFormData.highlightsFr}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, highlightsFr: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>Inclus (séparés par virgule, Français)</Label>
                        <Textarea
                          value={excursionFormData.includedFr}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, includedFr: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>Non inclus (séparés par virgule, Français)</Label>
                        <Textarea
                          value={excursionFormData.notIncludedFr}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, notIncludedFr: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                    </TabsContent>

                    {/* Spanish Tab */}
                    <TabsContent value="es" className="space-y-4">
                      <div>
                        <Label>Name (Español) *</Label>
                        <Input
                          value={excursionFormData.nameEs}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, nameEs: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Location (Español) *</Label>
                        <Input
                          value={excursionFormData.locationEs}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, locationEs: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Duration (Español) *</Label>
                        <Input
                          value={excursionFormData.durationEs}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, durationEs: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Description (Español) *</Label>
                        <Textarea
                          value={excursionFormData.descriptionEs}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, descriptionEs: e.target.value })}
                          rows={3}
                          required
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>Highlights (separados por coma, Español)</Label>
                        <Textarea
                          value={excursionFormData.highlightsEs}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, highlightsEs: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>Incluido (separados por coma, Español)</Label>
                        <Textarea
                          value={excursionFormData.includedEs}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, includedEs: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>No incluido (separados por coma, Español)</Label>
                        <Textarea
                          value={excursionFormData.notIncludedEs}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, notIncludedEs: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                    </TabsContent>

                    {/* Italian Tab */}
                    <TabsContent value="it" className="space-y-4">
                      <div>
                        <Label>Name (Italiano) *</Label>
                        <Input
                          value={excursionFormData.nameIt}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, nameIt: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Location (Italiano) *</Label>
                        <Input
                          value={excursionFormData.locationIt}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, locationIt: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Duration (Italiano) *</Label>
                        <Input
                          value={excursionFormData.durationIt}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, durationIt: e.target.value })}
                          required
                          className="rounded-full" />
                      </div>
                      <div>
                        <Label>Description (Italiano) *</Label>
                        <Textarea
                          value={excursionFormData.descriptionIt}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, descriptionIt: e.target.value })}
                          rows={3}
                          required
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>Highlights (separati da virgola, Italiano)</Label>
                        <Textarea
                          value={excursionFormData.highlightsIt}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, highlightsIt: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>Incluso (separati da virgola, Italiano)</Label>
                        <Textarea
                          value={excursionFormData.includedIt}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, includedIt: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                      <div>
                        <Label>Non incluso (separati da virgola, Italiano)</Label>
                        <Textarea
                          value={excursionFormData.notIncludedIt}
                          onChange={(e) => setExcursionFormData({ ...excursionFormData, notIncludedIt: e.target.value })}
                          rows={2}
                          className="rounded-[20px]" />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Images Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Images *</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={imageInputMode === 'url' ? 'default' : 'outline'}
                        onClick={() => setImageInputMode('url')}
                        className="h-8 text-xs rounded-full"
                      >
                        <LinkIcon className="w-3 h-3 mr-1" />
                        URL
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={imageInputMode === 'upload' ? 'default' : 'outline'}
                        onClick={() => setImageInputMode('upload')}
                        className="h-8 text-xs rounded-full"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </Button>
                    </div>
                  </div>

                  {imageInputMode === 'url' ? (
                    <Input
                      id="images"
                      value={excursionFormData.images}
                      onChange={(e) => setExcursionFormData({ ...excursionFormData, images: e.target.value })}
                      placeholder="Enter image URLs separated by commas"
                      required={!excursionFormData.images}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="flex-1 rounded-full"
                        />
                        {uploadingImage && (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted">
                        Max 5MB per image. Formats: JPEG, PNG, WebP, GIF
                      </p>
                    </div>
                  )}

                  {excursionFormData.images && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-muted">Added Images:</p>
                      <div className="flex flex-wrap gap-2">
                        {excursionFormData.images.split(',').map((img, idx) => {
                          const trimmedImg = img.trim();
                          if (!trimmedImg) return null;
                          return (
                            <div
                              key={idx}
                              className="relative group bg-secondary/30 rounded-full px-2 py-1 pr-7 text-xs flex items-center gap-2 max-w-xs"
                            >
                              <span className="truncate">{trimmedImg}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(trimmedImg)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3 text-destructive" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price and Other Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="priceMAD">Price (MAD) *</Label>
                    <Input
                      id="priceMAD"
                      type="number"
                      value={excursionFormData.priceMAD}
                      onChange={(e) => setExcursionFormData({ ...excursionFormData, priceMAD: e.target.value })}
                      required
                      className="rounded-full" />
                  </div>
                  <div>
                    <Label htmlFor="groupSize">Group Size *</Label>
                    <Input
                      id="groupSize"
                      value={excursionFormData.groupSize}
                      onChange={(e) => setExcursionFormData({ ...excursionFormData, groupSize: e.target.value })}
                      required
                      className="rounded-full" />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={excursionFormData.rating}
                      onChange={(e) => setExcursionFormData({ ...excursionFormData, rating: e.target.value })}
                      className="rounded-full" />
                  </div>
                </div>

                {/* Adults Only Toggle */}
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-[20px] border border-border/50 my-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-full shadow-sm">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="isAdultsOnly" className="text-base font-semibold block">Adults Only Restriction</Label>
                      <p className="text-xs text-muted-foreground">Only allow bookings for adults (12+ years)</p>
                    </div>
                  </div>
                  <Switch
                    id="isAdultsOnly"
                    checked={excursionFormData.isAdultsOnly}
                    onCheckedChange={(checked) => setExcursionFormData({ ...excursionFormData, isAdultsOnly: checked })}
                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-400"
                  />
                </div>

                {/* Schedule Section */}
                <div className="border-t pt-4">
                  <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Schedule & Availability
                  </h3>

                  {/* Available Days */}
                  <div className="space-y-3">
                    <Label>Available Days</Label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleDay('everyday')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${availableDays.includes('everyday')
                          ? 'bg-primary text-white'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                          }`}
                      >
                        Every Day
                      </button>
                      {DAYS_OF_WEEK.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${availableDays.includes(day) && !availableDays.includes('everyday')
                            ? 'bg-accent text-white'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                            }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time Slots
                      </Label>
                      <Button type="button" onClick={handleAddTimeSlot} size="sm" variant="outline" className="rounded-full">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Time Slot
                      </Button>
                    </div>

                    {timeSlots.length === 0 ? (
                      <p className="text-sm text-muted">No specific time slots. Available all day.</p>
                    ) : (
                      <div className="space-y-2">
                        {timeSlots.map((slot, index) => (
                          <div key={index} className="flex gap-2 items-center p-3 bg-secondary/30 rounded-[20px]">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs mb-1">Start Time</Label>
                                <Input
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => handleTimeSlotChange(index, 'startTime', e.target.value)}
                                  required
                                  className="rounded-full"
                                />
                              </div>
                              <div>
                                <Label className="text-xs mb-1">End Time</Label>
                                <Input
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) => handleTimeSlotChange(index, 'endTime', e.target.value)}
                                  required
                                  className="rounded-full"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTimeSlot(index)}
                              className="text-destructive rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setExcursionDialogOpen(false)} disabled={saving} className="rounded-full">
                    {t('dialog.cancel')}
                  </Button>
                  <Button type="submit" disabled={saving} className="rounded-full">
                    {saving ?
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('dialog.saving')}</> :
                      editingExcursion ? t('dialog.save') : t('dialog.create')
                    }
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main >
    </div >
  );
}