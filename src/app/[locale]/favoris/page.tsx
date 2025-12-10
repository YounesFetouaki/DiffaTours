'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/sections/header';
import Image from 'next/image';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/i18n/hooks';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';

// Helper function to extract text from multilingual field or string
const getLocalizedText = (field: any, locale: string): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    return field[locale] || field.en || field.fr || Object.values(field)[0] || '';
  }
  return '';
};

interface WishlistItem {
  id: number;
  userClerkId: string;
  excursionId: string;
  createdAt: string;
}

interface ExcursionData {
  id: string;
  name: string | any;
  images: string[];
  priceMAD: number;
  location: string | any;
  duration: string | any;
  description: string | any;
}

export default function FavorisPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'fr';
  const t = useTranslations();
  const { formatPrice } = useCurrency();

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [excursions, setExcursions] = useState<Map<string, ExcursionData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  // Fetch wishlist items
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push(`/${locale}/sign-in`);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/wishlists/user/${user.id}`);

        if (response.ok) {
          const data = await response.json();
          setWishlistItems(data);

          // Fetch excursion details for each wishlist item
          const excursionIds = [...new Set(data.map((item: WishlistItem) => item.excursionId))] as string[];
          const excursionsMap = new Map<string, ExcursionData>();

          await Promise.all(
            excursionIds.map(async (excursionId: string) => {
              try {
                const excursionResponse = await fetch(`/api/excursions/${excursionId}`);
                if (excursionResponse.ok) {
                  const excursionResult = await excursionResponse.json();
                  excursionsMap.set(excursionId, excursionResult.data);
                }
              } catch (error) {
                console.error(`Error fetching excursion ${excursionId}:`, error);
              }
            })
          );

          setExcursions(excursionsMap);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error(
          locale === 'fr' ? 'Erreur lors du chargement des favoris' : 'Error loading favorites'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, isLoaded, locale, router]);

  const handleRemove = async (wishlistId: number, excursionName: string) => {
    setRemoving(wishlistId);
    try {
      const response = await fetch(`/api/wishlists/${wishlistId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId));
        toast.success(
          locale === 'fr'
            ? `${excursionName} retiré de vos favoris`
            : `${excursionName} removed from favorites`
        );
      } else {
        throw new Error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(
        locale === 'fr'
          ? 'Erreur lors de la suppression'
          : 'Error removing item'
      );
    } finally {
      setRemoving(null);
    }
  };

  const handleViewExcursion = (excursionId: string) => {
    router.push(`/${locale}/excursion/${excursionId}`);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 pt-32 pb-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted">
              {locale === 'fr' ? 'Chargement...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Dark gradient overlay behind header */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/50 to-transparent z-40 pointer-events-none" />
      <main className="flex-1 pt-40 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              {locale === 'fr' ? 'Mes Favoris' : 'My Favorites'}
            </h1>
            <p className="text-muted">
              {locale === 'fr'
                ? `${wishlistItems.length} excursion${wishlistItems.length !== 1 ? 's' : ''} sauvegardée${wishlistItems.length !== 1 ? 's' : ''}`
                : `${wishlistItems.length} saved excursion${wishlistItems.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Empty State */}
          {wishlistItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {locale === 'fr' ? 'Aucun favori pour le moment' : 'No favorites yet'}
              </h2>
              <p className="text-muted mb-6">
                {locale === 'fr'
                  ? 'Commencez à ajouter des excursions à vos favoris'
                  : 'Start adding excursions to your favorites'}
              </p>
              <Button
                onClick={() => router.push(`/${locale}/nos-excursions`)}
                className="bg-primary hover:bg-primary/90"
              >
                {locale === 'fr' ? 'Découvrir les excursions' : 'Explore Excursions'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => {
                const excursion = excursions.get(item.excursionId);

                if (!excursion) {
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg overflow-hidden shadow-lg animate-pulse"
                    >
                      <div className="h-48 bg-gray-200" />
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  );
                }

                const excursionName = getLocalizedText(excursion.name, locale);
                const excursionLocation = getLocalizedText(excursion.location, locale);
                const excursionDescription = getLocalizedText(excursion.description, locale);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <div
                      className="relative h-48 overflow-hidden cursor-pointer"
                      onClick={() => handleViewExcursion(excursion.id)}
                    >
                      <Image
                        src={excursion.images[0] || 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80'}
                        alt={excursionName}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-foreground uppercase">
                          {excursionLocation}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.id, excursionName);
                        }}
                        disabled={removing === item.id}
                        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full transition-all z-10"
                        title={locale === 'fr' ? 'Retirer des favoris' : 'Remove from favorites'}
                      >
                        {removing === item.id ? (
                          <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-500" />
                        )}
                      </button>
                    </div>
                    <div className="p-4">
                      <h3
                        className="text-lg font-semibold text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleViewExcursion(excursion.id)}
                      >
                        {excursionName}
                      </h3>
                      <p className="text-sm text-muted line-clamp-2 mb-3">
                        {excursionDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold text-primary">
                            {formatPrice(excursion.priceMAD)}
                          </p>
                          <p className="text-xs text-muted">
                            {locale === 'fr' ? 'par personne' : 'per person'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleViewExcursion(excursion.id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {locale === 'fr' ? 'Réserver' : 'Book Now'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}