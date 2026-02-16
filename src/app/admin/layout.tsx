"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- THE ULTIMATE SECURITY GATE ---
  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push('/'); // Kick non-admins out
      } else {
        setUserEmail(session.user.email);
        setLoading(false); // Let them in
      }
    };

    checkAdminAccess();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Appointments', path: '/admin/appointments' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Customers', path: '/admin/customers' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-[#1B342B] text-xs uppercase tracking-[0.2em] font-bold animate-pulse">Verifying Security Clearance...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-[#1B342B] overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Desktop Fixed, Mobile Drawer) */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#1B342B] text-[#FDFBF7] z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-6 border-b border-white/10 flex flex-col items-center relative">
          <Image src="/LOGO/LOGO.png" alt="Gulab Mehndi" width={90} height={25} className="mb-4 invert object-contain" />
          <span className="text-[10px] uppercase tracking-widest text-[#A67C52] font-bold">Command Center</span>
          
          {/* Mobile Close Button */}
          <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 md:hidden text-white/50 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <nav className="flex-1 py-6 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.name} href={link.path} onClick={() => setIsSidebarOpen(false)}>
                <div className={`w-full text-left px-8 py-4 text-xs tracking-widest uppercase transition-all duration-300 ${isActive ? 'bg-[#A67C52] text-white font-bold border-l-4 border-white' : 'text-white/60 hover:bg-white/5 hover:text-white border-l-4 border-transparent'}`}>
                  {link.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10 bg-black/20">
          <p className="text-[10px] text-white/50 truncate mb-4">Authorized User:<br/><span className="text-white font-bold">{userEmail}</span></p>
          <button onClick={handleSignOut} className="w-full border border-red-500/50 text-red-400 py-2.5 rounded-sm hover:bg-red-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold">
            Sign Out & Lock
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* MOBILE TOPBAR */}
        <div className="md:hidden bg-white border-b border-[#1B342B]/10 p-4 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-[#1B342B] focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="text-xs uppercase tracking-widest font-bold text-[#1B342B]">Admin Portal</span>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        {/* SCROLLABLE PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gradient-to-br from-[#FDFBF7] to-white">
          {children}
        </div>
      </main>

    </div>
  );
}