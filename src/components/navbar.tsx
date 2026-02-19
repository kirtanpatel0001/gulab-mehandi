"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CartDrawer from '@/components/CartDrawer';

export type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stain_color?: string;
    weight_volume?: string;
  } | null;
};

const CURRENCY_REGIONS = {
  "North America": ["USD", "CAD"],
  "Middle East": ["AED", "SAR", "QAR"],
  "Asia": ["INR", "SGD", "JPY"],
  "Europe": ["EUR", "GBP"],
  "Oceania": ["AUD", "NZD"],
  "Africa & Others": ["ZAR"]
};

const SUPPORTED_CURRENCIES = Object.values(CURRENCY_REGIONS).flat();

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  // ✅ Self-contained auth — no AuthProvider needed
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // resolves after getSession()

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false);

  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [allRates, setAllRates] = useState<Record<string, number>>({});
  const [isCurrencyLoading, setIsCurrencyLoading] = useState(true);

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const cartFetchId = useRef(0);

  const closeAllMenus = useCallback(() => {
    setIsOpen(false);
    setDesktopDropdownOpen(false);
    setMobileDropdownOpen(false);
    setIsCartOpen(false);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node)) {
        setDesktopDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  // Currency init
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const ratesResponse = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
        const ratesData = await ratesResponse.json();
        const rates = ratesData.rates || {};
        setAllRates(rates);

        const cachedCurrency = localStorage.getItem('user_currency');
        if (cachedCurrency && rates[cachedCurrency]) {
          setCurrency(cachedCurrency);
          setExchangeRate(rates[cachedCurrency]);
          if (!controller.signal.aborted) setIsCurrencyLoading(false);
          return;
        }

        let detectedCode = 'USD';
        try {
          const curResponse = await fetch('https://ipapi.co/currency/', { signal: controller.signal });
          if (curResponse.ok) {
            detectedCode = (await curResponse.text()).trim();
          } else throw new Error("IP API Blocked");
        } catch (err: any) {
          if (err.name === 'AbortError') return;
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz === 'Asia/Kolkata') detectedCode = 'INR';
          else if (tz.startsWith('Asia/Dubai')) detectedCode = 'AED';
          else if (tz.startsWith('Asia/Riyadh')) detectedCode = 'SAR';
          else if (tz.startsWith('Europe/')) detectedCode = 'EUR';
          else if (tz === 'Europe/London') detectedCode = 'GBP';
          else if (tz.startsWith('Australia/')) detectedCode = 'AUD';
          else if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver')) detectedCode = 'CAD';
        }

        if (!SUPPORTED_CURRENCIES.includes(detectedCode) || !rates[detectedCode]) detectedCode = 'USD';

        if (!controller.signal.aborted) {
          setCurrency(detectedCode);
          setExchangeRate(rates[detectedCode] || 1);
          localStorage.setItem('user_currency', detectedCode);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') console.error("Currency init error:", error);
      } finally {
        if (!controller.signal.aborted) setIsCurrencyLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const handleCurrencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurr = e.target.value;
    setCurrency(newCurr);
    if (allRates[newCurr]) setExchangeRate(allRates[newCurr]);
    localStorage.setItem('user_currency', newCurr);
  }, [allRates]);

  const formatPrice = useCallback((usdPrice: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(usdPrice * exchangeRate);
  }, [currency, exchangeRate]);

  // Cart fetch
  const fetchCartData = useCallback(async (sessionUser: User | null) => {
    if (!sessionUser) { setCartItems([]); setIsCartLoading(false); return; }
    const fetchId = ++cartFetchId.current;
    setIsCartLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`id, quantity, product:products ( id, name, price, image_url, stain_color, weight_volume )`)
        .eq('user_id', sessionUser.id)
        .order('created_at', { ascending: true });

      if (fetchId !== cartFetchId.current) return;
      if (error) console.error("Cart Error:", error.message);
      else if (data) setCartItems(data as unknown as CartItem[]);
    } catch (err) {
      if (fetchId === cartFetchId.current) console.error("Cart fetch error:", err);
    } finally {
      if (fetchId === cartFetchId.current) setIsCartLoading(false);
    }
  }, []);

  // ✅ Auth init — getSession + listener. Zero router.refresh() calls.
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
          if (mounted) setUserRole(data?.role ?? 'user');
          fetchCartData(session.user);
        } else {
          setUser(null);
          setUserRole(null);
          setCartItems([]);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        // ✅ Always mark auth as resolved — this is what makes the avatar appear
        if (mounted) setAuthLoading(false);
      }
    };

    initAuth();

    // ✅ Listen for auth changes. No router.refresh() — that was killing dropdown state.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;

      if (!session || event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        setCartItems([]);
        setAuthLoading(false);
      } else if (session.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        if (mounted) {
          setUserRole(data?.role ?? 'user');
          fetchCartData(session.user);
          setAuthLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchCartData]);

  useEffect(() => {
    const handleCartUpdate = () => { if (user) fetchCartData(user); };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [user, fetchCartData]);

  useEffect(() => {
    if (isCartOpen && user) fetchCartData(user);
  }, [isCartOpen, user, fetchCartData]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const cartSubtotalUSD = useMemo(() => cartItems.reduce((total, item) => total + ((item.product?.price || 0) * item.quantity), 0), [cartItems]);

  const updateQuantity = useCallback(async (cartId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item => item.id === cartId ? { ...item, quantity: newQuantity } : item));
    const { error } = await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', cartId);
    if (error) setCartItems(prev => prev.map(item => item.id === cartId ? { ...item, quantity: currentQuantity } : item));
  }, []);

  const removeItem = useCallback(async (cartId: string) => {
    let snapshot: CartItem[] = [];
    setCartItems(prev => { snapshot = prev; return prev.filter(item => item.id !== cartId); });
    const { error } = await supabase.from('cart_items').delete().eq('id', cartId);
    if (error) setCartItems(snapshot);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setCartItems([]);
    closeAllMenus();
    router.push('/login');
  };

  const getInitial = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  if (pathname.startsWith('/admin')) return null;

  const renderDropdownContent = () => (
    <>
      <div className="px-4 py-3 border-b border-[#1B342B]/10 mb-2">
        <p className="text-sm font-bold text-[#1B342B] truncate">{user?.user_metadata?.full_name || 'Client'}</p>
        <p className="text-[10px] text-[#1B342B]/60 truncate">{user?.email}</p>
      </div>
      {userRole === 'admin' && (
        <Link href="/admin" onClick={closeAllMenus} className="block px-4 py-2 text-xs text-[#1B342B] hover:bg-[#1B342B]/5 font-semibold">Admin Dashboard</Link>
      )}
      <Link href="/my-appointments" onClick={closeAllMenus} className="block px-4 py-2 text-xs text-[#1B342B] hover:bg-[#1B342B]/5 font-semibold">My Appointments</Link>
      <Link href="/my-orders" onClick={closeAllMenus} className="block px-4 py-2 text-xs text-[#1B342B] hover:bg-[#1B342B]/5 font-semibold">My Orders</Link>
      <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold mt-1 border-t border-[#1B342B]/10">Sign Out</button>
    </>
  );

  // ✅ Skeleton → Avatar → Login icon
  const renderUserSection = (isMobile: boolean) => {
    if (authLoading) {
      return <div className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-[#1B342B]/15 animate-pulse`} />;
    }

    if (user) {
      return (
        <div className="relative" ref={isMobile ? mobileDropdownRef : desktopDropdownRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isMobile) setMobileDropdownOpen(prev => !prev);
              else setDesktopDropdownOpen(prev => !prev);
            }}
            className={`${isMobile ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-xs'} rounded-full bg-[#1B342B] text-[#FDFBF7] flex items-center justify-center font-bold hover:bg-[#A67C52] transition-colors shadow-sm cursor-pointer select-none`}
          >
            {getInitial()}
          </button>
          {(isMobile ? mobileDropdownOpen : desktopDropdownOpen) && (
            <div
              className="absolute right-0 mt-3 w-56 bg-white border border-[#1B342B]/10 rounded-sm shadow-xl py-2 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {renderDropdownContent()}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link href="/login" aria-label="Login" className="text-[#1B342B] hover:text-[#A67C52] transition-colors duration-300">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </Link>
    );
  };

  const renderCurrencyOptions = () => Object.entries(CURRENCY_REGIONS).map(([region, regionCurrencies]) => (
    <optgroup key={region} label={region} className="font-bold text-[#1B342B]/50">
      {regionCurrencies.map(c => (
        <option key={c} value={c} className="font-medium text-[#1B342B]">{c}</option>
      ))}
    </optgroup>
  ));

  return (
    <>
      <nav className="w-full bg-[#FDFBF7] px-4 md:px-8 py-2 sticky top-0 z-40 border-b border-[#1B342B]/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Mobile Hamburger */}
          <div className="flex-1 md:hidden">
            <button onClick={() => setIsOpen(true)} className="text-[#1B342B] focus:outline-none flex items-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          {/* Logo */}
          <div className="flex justify-center md:justify-start flex-1 md:flex-none">
            <Link href="/" onClick={closeAllMenus}>
              <Image src="/LOGO/LOGO.png" alt="Gulab Mehndi Logo" width={85} height={20} className="cursor-pointer object-contain" />
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            <Link href="/" className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5">Home</Link>
            <Link href="/shop" className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5">Shop</Link>
            <Link href="/story" className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5">Our Story</Link>
            <Link href="/services" className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5">Services</Link>
            <Link href="/gallery" className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5">Gallery</Link>
            <Link href="/reviews" className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5">Reviews</Link>
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center space-x-5 lg:space-x-6">
            <select value={currency} onChange={handleCurrencyChange} disabled={isCurrencyLoading}
              className="bg-transparent text-[#1B342B] text-sm font-semibold focus:outline-none cursor-pointer hover:text-[#A67C52] transition-colors disabled:opacity-50">
              {renderCurrencyOptions()}
            </select>

            <button onClick={() => setIsCartOpen(true)} className="relative text-[#1B342B] hover:text-[#A67C52] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#A67C52] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>

            {renderUserSection(false)}

            <Link href="/book" className="bg-[#1B342B] text-[#FDFBF7] px-5 py-1.5 rounded hover:bg-[#A67C52] transition-colors duration-300 font-medium inline-block text-center">Book Now</Link>
          </div>

          {/* Mobile Right */}
          <div className="flex-1 md:hidden flex justify-end space-x-4 text-[#1B342B] items-center">
            <select value={currency} onChange={handleCurrencyChange} disabled={isCurrencyLoading}
              className="bg-transparent text-[#1B342B] text-xs font-bold focus:outline-none cursor-pointer hover:text-[#A67C52] disabled:opacity-50">
              {renderCurrencyOptions()}
            </select>

            <button onClick={() => setIsCartOpen(true)} className="relative text-[#1B342B] hover:text-[#A67C52] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#A67C52] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>

            {renderUserSection(true)}
          </div>
        </div>
      </nav>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        user={user}
        authLoading={authLoading}
        cartItems={cartItems}
        isCartLoading={isCartLoading}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        cartSubtotalUSD={cartSubtotalUSD}
        formatPrice={formatPrice}
      />

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300" onClick={closeAllMenus}></div>
      )}

      <div className={`fixed top-0 left-0 h-full w-[80%] max-w-[320px] bg-[#FDFBF7] z-40 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-[#1B342B] px-6 py-5 flex justify-between items-center text-[#FDFBF7]">
          <Image src="/LOGO/LOGO.png" alt="Gulab Mehndi" width={80} height={20} className="invert object-contain" />
          <button onClick={closeAllMenus} className="p-1 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <Link href="/" onClick={closeAllMenus} className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]">Home</Link>
          <Link href="/shop" onClick={closeAllMenus} className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]">Shop Boutique</Link>
          <Link href="/services" onClick={closeAllMenus} className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]">Bridal Services</Link>
          <Link href="/gallery" onClick={closeAllMenus} className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]">Gallery</Link>
          <Link href="/story" onClick={closeAllMenus} className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]">Our Story</Link>
          <Link href="/reviews" onClick={closeAllMenus} className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]">Reviews</Link>
        </div>
        <div className="p-6 border-t border-[#1B342B]/10 bg-[#F4F1ED]">
          <Link href="/book" onClick={closeAllMenus} className="w-full bg-[#1B342B] text-[#FDFBF7] py-3 rounded hover:bg-[#A67C52] transition-colors duration-300 font-medium shadow-sm block text-center">Book Appointment</Link>
        </div>
      </div>
    </>
  );
}