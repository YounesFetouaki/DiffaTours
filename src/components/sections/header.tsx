"use client";

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Menu, X, Globe, DollarSign, User, ShoppingCart, Settings, QrCode, Heart, LogOut } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/hooks';
import { usePathname } from '@/i18n/routing';
import { useParams, useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import { useUser, useClerk } from '@clerk/nextjs';
import { NotificationBell } from '@/components/NotificationBell';
import { toast } from 'sonner';

const navLinks = [
  { href: "/", label: "nav.home" },
  // HIDDEN: Circuits link - keep for future use
  // { href: "/circuits", label: "nav.circuits" },
  { href: "/nos-excursions", label: "nav.excursions" },
  { href: "/qui-sommes-nous", label: "nav.about" },
  { href: "/autres-services", label: "nav.services" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const { currency, setCurrency } = useCurrency();
  const { cartCount } = useCart();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const isAdmin = userRole === 'admin';
  const isStaff = userRole === 'staff';
  const isStaffOrAdmin = isAdmin || isStaff;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch user role from MongoDB
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.data?.role) {
            setUserRole(data.data.role);
          }
        })
        .catch(err => console.error('Error fetching user role:', err));
    }
  }, [user?.id]);

  const switchLocale = (newLocale: 'en' | 'fr' | 'es' | 'it') => {
    const newPath = `/${newLocale}${pathname}`;
    router.push(newPath);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push(`/${locale}`);
    } catch (error) {
      toast.error('Sign out failed');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'bg-white shadow-2xl' : ''}`}
        style={!isScrolled ? {
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
          backdropFilter: 'blur(10px) saturate(120%)',
          WebkitBackdropFilter: 'blur(10px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 20px rgba(2, 8, 23, 0.5), 0 0 30px rgba(255, 255, 255, 0.03) inset'
        } : undefined}
      >
        <div className="mx-auto max-w-none">

          {/* Desktop Double Header */}
          <div className="hidden md:block">
            {/* First Bar - Translation, Currency, Client Login */}
            <div className={`border-b ${isScrolled ? 'border-gray-200' : 'border-white/10'}`}>
              <div className="px-5 lg:px-20 h-14 flex items-center justify-between gap-4">
                {/* Left side - Translation and Currency */}
                <div className="flex items-center gap-3 animate-fadeInDown">
                  {/* Language Switcher */}
                  <div className={`rounded-full px-4 py-2 flex items-center gap-2 ${isScrolled ? 'bg-gray-100' : 'glass-light'}`}>
                    <Globe className={`w-4 h-4 ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
                    <button
                      onClick={() => switchLocale('en')}
                      className={`text-xs font-semibold transition-all ${locale === 'en' ? (isScrolled ? 'text-black scale-110' : 'text-white scale-110') : (isScrolled ? 'text-gray-600 hover:text-black' : 'text-white/60 hover:text-white')}`}
                    >
                      EN
                    </button>
                    <span className={isScrolled ? 'text-gray-300' : 'text-white/30'}>|</span>
                    <button
                      onClick={() => switchLocale('fr')}
                      className={`text-xs font-semibold transition-all ${locale === 'fr' ? (isScrolled ? 'text-black scale-110' : 'text-white scale-110') : (isScrolled ? 'text-gray-600 hover:text-black' : 'text-white/60 hover:text-white')}`}
                    >
                      FR
                    </button>
                    <span className={isScrolled ? 'text-gray-300' : 'text-white/30'}>|</span>
                    <button
                      onClick={() => switchLocale('es')}
                      className={`text-xs font-semibold transition-all ${locale === 'es' ? (isScrolled ? 'text-black scale-110' : 'text-white scale-110') : (isScrolled ? 'text-gray-600 hover:text-black' : 'text-white/60 hover:text-white')}`}
                    >
                      ES
                    </button>
                    <span className={isScrolled ? 'text-gray-300' : 'text-white/30'}>|</span>
                    <button
                      onClick={() => switchLocale('it')}
                      className={`text-xs font-semibold transition-all ${locale === 'it' ? (isScrolled ? 'text-black scale-110' : 'text-white scale-110') : (isScrolled ? 'text-gray-600 hover:text-black' : 'text-white/60 hover:text-white')}`}
                    >
                      IT
                    </button>
                  </div>

                  {/* Currency Switcher */}
                  <div className={`rounded-full px-4 py-2 flex items-center gap-2 ${isScrolled ? 'bg-gray-100' : 'glass-light'}`}>
                    <DollarSign className={`w-4 h-4 ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
                    <button
                      onClick={() => setCurrency('MAD')}
                      className={`text-xs font-semibold transition-all ${currency === 'MAD' ? (isScrolled ? 'text-black scale-110' : 'text-white scale-110') : (isScrolled ? 'text-gray-600 hover:text-black' : 'text-white/60 hover:text-white')}`}
                    >
                      MAD
                    </button>
                    <span className={isScrolled ? 'text-gray-300' : 'text-white/30'}>|</span>
                    <button
                      onClick={() => setCurrency('USD')}
                      className={`text-xs font-semibold transition-all ${currency === 'USD' ? (isScrolled ? 'text-black scale-110' : 'text-white scale-110') : (isScrolled ? 'text-gray-600 hover:text-black' : 'text-white/60 hover:text-white')}`}
                    >
                      USD
                    </button>
                    <span className={isScrolled ? 'text-gray-300' : 'text-white/30'}>|</span>
                    <button
                      onClick={() => setCurrency('EUR')}
                      className={`text-xs font-semibold transition-all ${currency === 'EUR' ? (isScrolled ? 'text-black scale-110' : 'text-white scale-110') : (isScrolled ? 'text-gray-600 hover:text-black' : 'text-white/60 hover:text-white')}`}
                    >
                      EUR
                    </button>
                    <span className={isScrolled ? 'text-gray-300' : 'text-white/30'}>|</span>
                    <button
                      onClick={() => setCurrency('GBP')}
                      className={`text-xs font-semibold transition-all ${currency === 'GBP' ? (isScrolled ? 'text-black scale-110' : 'text-white scale-110') : (isScrolled ? 'text-gray-600 hover:text-black' : 'text-white/60 hover:text-white')}`}
                    >
                      GBP
                    </button>
                  </div>
                </div>

                {/* Right side - Cart, Wishlist, Notifications and Auth */}
                <div className="flex items-center gap-2 animate-fadeInDown">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`text-xs px-4 py-2 rounded-full flex items-center gap-1.5 font-semibold transition-all ${isScrolled ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'glass-light hover:glass-strong text-white'}`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">Admin</span>
                    </Link>
                  )}

                  {isStaffOrAdmin && (
                    <Link
                      href="/staff"
                      className={`text-xs px-4 py-2 rounded-full flex items-center gap-1.5 font-semibold transition-all ${isScrolled ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'glass-light hover:glass-strong text-white'}`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">Staff</span>
                    </Link>
                  )}

                  {/* Cart Icon */}
                  <Link
                    href="/cart"
                    className={`relative p-2 rounded-full transition-all ${isScrolled ? 'bg-gray-100 hover:bg-gray-200' : 'glass-light hover:glass-strong'}`}
                  >
                    <ShoppingCart className={`w-4 h-4 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
                    {isClient && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#FFB73F] to-[#e69d1a] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Wishlist/Favorites Icon - Only for signed in users */}
                  {user && (
                    <Link
                      href="/favoris"
                      className={`p-2 rounded-full transition-all ${isScrolled ? 'bg-gray-100 hover:bg-gray-200' : 'glass-light hover:glass-strong'}`}
                      title={locale === 'fr' ? 'Mes Favoris' : 'My Favorites'}
                    >
                      <Heart className={`w-4 h-4 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
                    </Link>
                  )}

                  {/* Notification Bell - Only for signed in users */}
                  {user && (
                    <NotificationBell isScrolled={isScrolled} />
                  )}

                  {!user && isLoaded && (
                    <Link
                      href="/sign-in"
                      className={`text-xs px-4 py-2 rounded-full font-semibold transition-all ${isScrolled ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'glass-light hover:glass-strong text-white'}`}
                    >
                      {t('header.signIn')}
                    </Link>
                  )}
                  {user && (
                    <>
                      <Link
                        href="/mon-compte"
                        className={`text-xs px-4 py-2 rounded-full flex items-center gap-1.5 font-semibold transition-all ${isScrolled ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'glass-light hover:glass-strong text-white'}`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">{t('header.myAccount')}</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className={`text-xs px-4 py-2 rounded-full flex items-center gap-1.5 font-semibold transition-all ${isScrolled ? 'bg-red-100 hover:bg-red-200 text-red-900' : 'glass-light hover:glass-strong text-white'}`}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Second Bar - Logo and Navigation */}
            <div className="px-5 lg:px-20">
              <div className="h-20 w-full flex items-center">
                <div className="flex-1 animate-scaleIn">
                  <Link href="/" className="inline-block hover:scale-105 transition-transform bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                    <Image
                      src="/logo.png"
                      alt="Diffa Tours"
                      width={80}
                      height={80}
                      className="h-14 w-auto drop-shadow-lg"
                      priority
                    />
                  </Link>
                </div>

                <div className="flex-none animate-fadeInUp">
                  <nav>
                    <ul className="flex items-center space-x-8">
                      {navLinks.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={`text-sm font-semibold uppercase tracking-[0.05em] transition-all hover:text-[#FFB73F] hover:scale-105 relative group ${isScrolled ? 'text-black' : 'text-white'}`}
                          >
                            {t(link.label)}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFB73F] to-[#70CFF1] group-hover:w-full transition-all duration-300"></span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                <div className="flex flex-1 justify-end animate-scaleIn">
                  <Link
                    href="/contact"
                    className={`btn ${isScrolled ? 'btn-primary' : 'btn-primary'}`}
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex h-20 w-full items-center justify-between md:hidden px-5">
            <button onClick={() => setIsMenuOpen(true)} aria-label="Open menu" className={`p-2 rounded-full transition-all ${isScrolled ? 'bg-gray-100 hover:bg-gray-200' : 'glass-light hover:glass-strong'}`}>
              <Menu className={`h-6 w-6 ${isScrolled ? 'text-black' : 'text-white'}`} />
            </button>

            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <Image
                src="/logo.png"
                alt="Diffa Tours"
                width={60}
                height={60}
                className="h-12 w-auto drop-shadow-lg"
                priority
              />
            </Link>

            <div className="flex items-center gap-2">
              {/* Mobile Cart Icon */}
              <Link
                href="/cart"
                className={`relative p-2 rounded-full transition-all ${isScrolled ? 'bg-gray-100 hover:bg-gray-200' : 'glass-light hover:glass-strong'}`}
              >
                <ShoppingCart className={`h-5 w-5 ${isScrolled ? 'text-black' : 'text-white'}`} />
                {isClient && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#FFB73F] to-[#e69d1a] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Wishlist Icon */}
              {user && (
                <Link href="/favoris" className={`p-2 rounded-full transition-all ${isScrolled ? 'bg-gray-100 hover:bg-gray-200' : 'glass-light hover:glass-strong'}`}>
                  <Heart className={`h-5 w-5 ${isScrolled ? 'text-black' : 'text-white'}`} />
                </Link>
              )}

              {/* Mobile Notification Bell */}
              {user && (
                <NotificationBell isScrolled={isScrolled} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel - Full Screen Glass */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ease-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        aria-modal="true"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />

        <div
          className={`absolute right-0 top-0 h-full w-full max-w-sm glass-strong shadow-2xl transition-transform duration-500 ease-out overflow-y-auto ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end p-6">
            <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="p-2 rounded-full glass-light hover:glass-strong transition-all">
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Language & Currency Switchers */}
          <div className="px-6 space-y-4 border-b border-white/10 pb-6">
            <div className="glass-light rounded-full px-4 py-3 flex items-center justify-center gap-3">
              <Globe className="w-4 h-4 text-white" />
              <button
                onClick={() => switchLocale('en')}
                className={`text-sm font-semibold ${locale === 'en' ? 'text-white scale-110' : 'text-white/60'}`}
              >
                EN
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => switchLocale('fr')}
                className={`text-sm font-semibold ${locale === 'fr' ? 'text-white scale-110' : 'text-white/60'}`}
              >
                FR
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => switchLocale('es')}
                className={`text-sm font-semibold ${locale === 'es' ? 'text-white scale-110' : 'text-white/60'}`}
              >
                ES
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => switchLocale('it')}
                className={`text-sm font-semibold ${locale === 'it' ? 'text-white scale-110' : 'text-white/60'}`}
              >
                IT
              </button>
            </div>

            <div className="glass-light rounded-full px-4 py-3 flex items-center justify-center gap-3">
              <DollarSign className="w-4 h-4 text-white" />
              <button
                onClick={() => setCurrency('MAD')}
                className={`text-sm font-semibold ${currency === 'MAD' ? 'text-white scale-110' : 'text-white/60'}`}
              >
                MAD
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => setCurrency('USD')}
                className={`text-sm font-semibold ${currency === 'USD' ? 'text-white scale-110' : 'text-white/60'}`}
              >
                USD
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => setCurrency('EUR')}
                className={`text-sm font-semibold ${currency === 'EUR' ? 'text-white scale-110' : 'text-white/60'}`}
              >
                EUR
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => setCurrency('GBP')}
                className={`text-sm font-semibold ${currency === 'GBP' ? 'text-white scale-110' : 'text-white/60'}`}
              >
                GBP
              </button>
            </div>
          </div>

          <nav className="mt-10 px-6">
            <ul className="flex flex-col items-center space-y-6">
              {navLinks.map((link, index) => (
                <li key={link.href} className="w-full animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center glass-light rounded-[20px] px-6 py-4 text-lg font-semibold uppercase tracking-wider text-white transition-all hover:glass-strong hover:scale-105"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-10 px-6 pt-6 border-t border-white/10 space-y-4">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="btn-glass w-full py-4 flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            {isStaffOrAdmin && (
              <Link
                href="/staff"
                onClick={() => setIsMenuOpen(false)}
                className="btn-glass w-full py-4 flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Staff Panel
              </Link>
            )}

            {user && (
              <Link
                href="/favoris"
                onClick={() => setIsMenuOpen(false)}
                className="btn-glass w-full py-4 flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" />
                {locale === 'fr' ? 'Mes Favoris' : 'My Favorites'}
              </Link>
            )}

            {!user && isLoaded && (
              <Link
                href="/sign-in"
                onClick={() => setIsMenuOpen(false)}
                className="btn-primary w-full py-4"
              >
                {t('header.signIn')}
              </Link>
            )}
            {user && (
              <>
                <Link
                  href="/mon-compte"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-secondary w-full py-4 flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {t('header.myAccount')}
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="btn-glass w-full py-4 flex items-center justify-center gap-2 text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  {t('header.signOut') || 'Sign Out'}
                </button>
              </>
            )}

            <Link href="/contact" className="btn-primary w-full py-4" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}