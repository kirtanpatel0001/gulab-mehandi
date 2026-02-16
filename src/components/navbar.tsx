"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // --- UI STATES ---
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu Drawer
  const [isCartOpen, setIsCartOpen] = useState(false); // Cart Slide-Out
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  
  // --- DATA STATES ---
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const closeAllMenus = () => {
    setIsOpen(false);
    setDesktopDropdownOpen(false);
    setMobileDropdownOpen(false);
    setIsCartOpen(false);
  };

  // Close dropdowns if user clicks outside of them
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

  // --- FETCH USER & DATABASE ROLE ---
  useEffect(() => {
    const fetchUserAndRole = async (sessionUser: any) => {
      setUser(sessionUser);
      if (sessionUser) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionUser.id)
          .single();
        
        setUserRole(data?.role || 'user');
      } else {
        setUserRole(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndRole(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndRole(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- SIGN OUT HANDLER ---
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    closeAllMenus();
    router.push('/login'); 
  };

  const getInitial = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  // --- Hide Navbar on Admin Pages ---
  if (pathname.startsWith('/admin')) {
    return null; 
  }

  // Helper component for the Dropdown Links to keep code clean
  const DropdownContent = () => (
    <>
      <div className="px-4 py-3 border-b border-[#1B342B]/10 mb-2">
        <p className="text-sm font-bold text-[#1B342B] truncate">{user?.user_metadata?.full_name || 'Client'}</p>
        <p className="text-[10px] text-[#1B342B]/60 truncate">{user?.email}</p>
      </div>
      
      {userRole === 'admin' && (
        <Link href="/admin" onClick={closeAllMenus} className="block px-4 py-2 text-xs text-[#1B342B] hover:bg-[#1B342B]/5 font-semibold flex items-center">
          <svg className="w-4 h-4 mr-2 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Admin Dashboard
        </Link>
      )}

      <Link href="/my-appointments" onClick={closeAllMenus} className="block px-4 py-2 text-xs text-[#1B342B] hover:bg-[#1B342B]/5 font-semibold flex items-center">
        <svg className="w-4 h-4 mr-2 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        My Appointments
      </Link>
      <Link href="/my-orders" onClick={closeAllMenus} className="block px-4 py-2 text-xs text-[#1B342B] hover:bg-[#1B342B]/5 font-semibold flex items-center">
        <svg className="w-4 h-4 mr-2 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        My Orders
      </Link>

      <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold transition-colors mt-1 border-t border-[#1B342B]/10 flex items-center">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        Sign Out
      </button>
    </>
  );

  return (
    <>
      <nav className="w-full bg-[#FDFBF7] px-4 md:px-8 py-2 sticky top-0 z-40 border-b border-[#1B342B]/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* MOBILE LEFT: Hamburger Menu */}
          <div className="flex-1 md:hidden">
            <button onClick={() => setIsOpen(true)} className="text-[#1B342B] focus:outline-none flex items-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          {/* LOGO */}
          <div className="flex justify-center md:justify-start flex-1 md:flex-none">
            <Link href="/" onClick={closeAllMenus}>
              <Image src="/LOGO/LOGO.png" alt="Gulab Mehndi Logo" width={85} height={20} className="cursor-pointer object-contain" />
            </Link>
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            <Link href="/" className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5">Home</Link>
            <Link href="/shop" className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5">Shop</Link>
            <Link href="/services" className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5">Services</Link>
            <Link href="/gallery" className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5">Gallery</Link>
            <Link href="/reviews" className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5">Reviews</Link>
          </div>

          {/* DESKTOP RIGHT (CART & AVATAR) */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Desktop Cart Button */}
            <button onClick={() => setIsCartOpen(true)} className="relative text-[#1B342B] hover:text-[#A67C52] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="absolute -top-1.5 -right-1.5 bg-[#A67C52] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </button>
            
            {user ? (
              <div className="relative" ref={desktopDropdownRef}>
                <div 
                  onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-[#1B342B] text-[#FDFBF7] flex items-center justify-center text-xs font-bold hover:bg-[#A67C52] transition-colors shadow-sm cursor-pointer select-none"
                >
                  {getInitial()}
                </div>

                {desktopDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-[#1B342B]/10 rounded-sm shadow-xl py-2 z-50">
                    <DropdownContent />
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" aria-label="Login" className="text-[#1B342B] hover:text-[#A67C52] transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </Link>
            )}

            <Link href="/book">
              <button className="bg-[#1B342B] text-[#FDFBF7] px-5 py-1.5 rounded hover:bg-[#A67C52] transition-colors duration-300 font-medium">Book Now</button>
            </Link>
          </div>

          {/* MOBILE RIGHT (CART & AVATAR DROPDOWN) */}
          <div className="flex-1 md:hidden flex justify-end space-x-4 text-[#1B342B] items-center">
            
            {/* Mobile Cart Button */}
            <button onClick={() => setIsCartOpen(true)} className="relative text-[#1B342B] hover:text-[#A67C52] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="absolute -top-1.5 -right-1.5 bg-[#A67C52] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </button>

            {/* Mobile Avatar & Dropdown */}
            {user ? (
               <div className="relative" ref={mobileDropdownRef}>
                 <div onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)} className="w-7 h-7 rounded-full bg-[#1B342B] text-[#FDFBF7] flex items-center justify-center text-[10px] font-bold cursor-pointer">
                   {getInitial()}
                 </div>

                 {/* Dropdown opens RIGHT HERE in mobile instead of side drawer */}
                 {mobileDropdownOpen && (
                   <div className="absolute right-0 mt-3 w-56 bg-white border border-[#1B342B]/10 rounded-sm shadow-xl py-2 z-50">
                     <DropdownContent />
                   </div>
                 )}
               </div>
            ) : (
              <Link href="/login" aria-label="Login">
                <svg className="w-5 h-5 hover:text-[#A67C52] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* --- CART DRAWER (SLIDES IN FROM THE LEFT) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300" onClick={() => setIsCartOpen(false)}></div>
      )}

      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-[380px] bg-[#FDFBF7] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isCartOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Cart Header */}
        <div className="p-6 border-b border-[#1B342B]/10 flex justify-between items-center bg-white">
          <h2 className="text-2xl font-serif text-[#1B342B] flex items-center">
            Your Cart
            <span className="ml-3 bg-[#1B342B]/5 text-[#1B342B] text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold">0 Items</span>
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-[#1B342B]/40 hover:text-[#1B342B] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* Cart Empty State (Placeholder until we build global cart state) */}
        <div className="flex-1 p-8 flex flex-col justify-center items-center text-center overflow-y-auto">
           <svg className="w-20 h-20 text-[#1B342B]/10 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
           <p className="text-[#1B342B]/60 text-sm mb-6">Your shopping cart is currently empty. Explore our organic henna cones and sealants.</p>
           <button onClick={() => { setIsCartOpen(false); router.push('/shop'); }} className="border border-[#A67C52] text-[#A67C52] px-8 py-3 rounded-sm hover:bg-[#A67C52] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
             Browse Boutique
           </button>
        </div>

        {/* Cart Footer */}
        <div className="p-6 bg-white border-t border-[#1B342B]/10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs uppercase tracking-widest font-bold text-[#1B342B]/60">Estimated Total</span>
            <span className="text-xl font-bold text-[#1B342B]">$0.00</span>
          </div>
          <button disabled className="w-full bg-[#1B342B] text-white py-4 rounded-sm hover:bg-[#A67C52] transition-colors uppercase text-xs font-bold tracking-[0.2em] disabled:opacity-50 shadow-md">
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* --- MAIN MOBILE NAV DRAWER (REMAINS ON THE LEFT) --- */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300" onClick={closeAllMenus}></div>
      )}

      <div className={`fixed top-0 left-0 h-full w-[80%] max-w-[320px] bg-[#FDFBF7] z-40 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-[#1B342B] px-6 py-5 flex justify-between items-center text-[#FDFBF7]">
          <div>
            <Image src="/LOGO/LOGO.png" alt="Gulab Mehndi" width={80} height={20} className="invert object-contain" />
          </div>
          <button onClick={closeAllMenus} className="p-1 focus:outline-none">
            <svg className="w-6 h-6 text-[#FDFBF7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <Link href="/" onClick={closeAllMenus} className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]">Home</Link>
          <Link href="/shop" onClick={closeAllMenus} className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]">Shop Boutique</Link>
          <Link href="/services" onClick={closeAllMenus} className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]">Bridal Services</Link>
          <Link href="/gallery" onClick={closeAllMenus} className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]">Gallery</Link>
          <Link href="/reviews" onClick={closeAllMenus} className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]">Reviews</Link>
        </div>

        <div className="p-6 border-t border-[#1B342B]/10 bg-[#F4F1ED]">
          <Link href="/book" onClick={closeAllMenus}>
            <button className="w-full bg-[#1B342B] text-[#FDFBF7] py-3 rounded hover:bg-[#A67C52] transition-colors duration-300 font-medium shadow-sm">
              Book Appointment
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}