'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUser, useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Notification {
  _id: string;
  userId: string;
  type: 'order_created' | 'order_confirmed' | 'order_rejected';
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  isScrolled?: boolean;
}

export const NotificationBell = ({ isScrolled = false }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      if (!user) return;

      const token = await getToken();
      if (!token) {
        // User not authenticated, skip silently
        return;
      }

      const response = await fetch('/api/notifications?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
      } else if (response.status === 401) {
        // Unauthorized - user not logged in, just skip silently
        return;
      }
    } catch (error) {
      // Silently fail - don't spam console with errors
      return;
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      // Silently fail
      return;
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('All notifications marked as read');
        fetchNotifications();
      } else {
        toast.error('Failed to mark all as read');
      }
    } catch (error) {
      toast.error('Failed to mark all as read');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchNotifications();
        toast.success('Notification deleted');
      } else {
        toast.error('Failed to delete notification');
      }
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }

    // Close popover
    setOpen(false);

    // Navigate to relevant page based on notification type
    if (notification.type === 'order_created') {
      // Admin notifications - go to admin panel
      router.push('/fr/admin?tab=orders');
    } else if (notification.type === 'order_confirmed' || notification.type === 'order_rejected') {
      // User notifications - go to reservations page
      router.push('/fr/mes-reservations');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_created':
        return '🆕';
      case 'order_confirmed':
        return '✅';
      case 'order_rejected':
        return '❌';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  };

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`relative p-2 rounded-full transition-all ${isScrolled ? 'bg-gray-100 hover:bg-gray-200' : 'glass-light hover:glass-strong'}`}
          aria-label="Notifications"
        >
          <Bell className={`w-4 h-4 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="text-xs"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Tout marquer lu
            </Button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucune notification</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 border-b hover:bg-secondary/50 transition-colors cursor-pointer group ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification._id);
                            }}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t bg-secondary/20">
            <Button
              variant="ghost"
              className="w-full text-xs"
              onClick={() => {
                setOpen(false);
                router.push('/fr/mes-reservations');
              }}
            >
              Voir toutes les notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};