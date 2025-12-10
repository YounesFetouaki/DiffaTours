'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';

interface WishlistButtonProps {
  excursionId: string;
  excursionName?: string;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'icon-only';
}

export const WishlistButton = ({
  excursionId,
  excursionName,
  className = '',
  showLabel = false,
  variant = 'default'
}: WishlistButtonProps) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'fr';
  
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if excursion is in wishlist
  useEffect(() => {
    if (!user?.id || !excursionId) {
      setChecking(false);
      return;
    }

    const checkWishlist = async () => {
      try {
        const response = await fetch(
          `/api/wishlists/check?userClerkId=${user.id}&excursionId=${excursionId}`
        );
        if (response.ok) {
          const data = await response.json();
          setInWishlist(data.inWishlist);
          setWishlistId(data.wishlistId);
        }
      } catch (error) {
        console.error('Error checking wishlist:', error);
      } finally {
        setChecking(false);
      }
    };

    checkWishlist();
  }, [user?.id, excursionId]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoaded || !user) {
      toast.error(locale === 'fr' ? 'Veuillez vous connecter pour ajouter aux favoris' : 'Please sign in to add to wishlist');
      router.push(`/${locale}/sign-in`);
      return;
    }

    setLoading(true);

    try {
      if (inWishlist && wishlistId) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlists/${wishlistId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setInWishlist(false);
          setWishlistId(null);
          toast.success(
            locale === 'fr' 
              ? 'Retiré de vos favoris' 
              : 'Removed from wishlist'
          );
        } else {
          throw new Error('Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userClerkId: user.id,
            excursionId: excursionId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setInWishlist(true);
          setWishlistId(data.id);
          toast.success(
            locale === 'fr' 
              ? `${excursionName || 'Excursion'} ajouté aux favoris` 
              : `${excursionName || 'Excursion'} added to wishlist`
          );
        } else {
          throw new Error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(
        locale === 'fr' 
          ? 'Une erreur est survenue' 
          : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || checking) {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 transition-all ${className}`}
      >
        <Heart className="w-5 h-5 text-gray-300 animate-pulse" />
        {showLabel && <span className="text-sm">Loading...</span>}
      </button>
    );
  }

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleToggleWishlist}
        disabled={loading}
        className={`p-2 rounded-full bg-white/90 hover:bg-white transition-all ${
          inWishlist ? 'text-red-500' : 'text-gray-600'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'} ${className}`}
        title={inWishlist ? (locale === 'fr' ? 'Retirer des favoris' : 'Remove from wishlist') : (locale === 'fr' ? 'Ajouter aux favoris' : 'Add to wishlist')}
      >
        <Heart 
          className={`w-5 h-5 transition-all ${inWishlist ? 'fill-current' : ''}`} 
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
        inWishlist
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${className}`}
    >
      <Heart 
        className={`w-5 h-5 transition-all ${inWishlist ? 'fill-current' : ''}`} 
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {loading ? (
            locale === 'fr' ? 'Chargement...' : 'Loading...'
          ) : inWishlist ? (
            locale === 'fr' ? 'Dans les favoris' : 'In Wishlist'
          ) : (
            locale === 'fr' ? 'Ajouter aux favoris' : 'Add to Wishlist'
          )}
        </span>
      )}
    </button>
  );
};
