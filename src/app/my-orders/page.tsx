"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// --- GEO-LOCATION CURRENCY LOGIC ---
const detectUserCurrency = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('Asia/Colombo')) {
      return { code: 'INR', symbol: '₹', rate: 83.15 }; 
    }
    if (tz.includes('London') || tz.includes('Europe')) {
      return { code: 'GBP', symbol: '£', rate: 0.79 };
    }
    if (tz.includes('Dubai') || tz.includes('Asia/Dubai')) {
      return { code: 'AED', symbol: 'د.إ', rate: 3.67 };
    }
    return { code: 'USD', symbol: '$', rate: 1 };
  } catch (error) {
    return { code: 'USD', symbol: '$', rate: 1 };
  }
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Animation States
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false); // Controls the 3D Animation
  
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });

  useEffect(() => {
    setCurrency(detectUserCurrency());

    const fetchMyOrders = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_name', session.user.user_metadata?.full_name || 'Anonymous')
        .order('created_at', { ascending: false });

      // LUXURY FAKE ORDER
      const sampleOrder = {
        id: 'ORD-9988-SAMPLE',
        created_at: new Date().toISOString(),
        status: 'Processing',
        total: 45.00, 
        items: [
          { name: 'Signature Organic Henna Cones', qty: 2, price: 15.00 },
          { name: 'Bridal Aftercare Sealant', qty: 1, price: 15.00 }
        ]
      };

      if (data && data.length > 0) {
        setOrders([...data, sampleOrder]); 
      } else {
        setOrders([sampleOrder]);
      }
      setLoading(false);
    };

    fetchMyOrders();
  }, [router]);

  // --- TRIGGER ENVELOPE ANIMATION ---
  const handleOpenOrder = (order: any) => {
    setSelectedOrder(order);
    setIsEnvelopeOpen(false); // Start closed
    // Wait 600ms so they see the sealed envelope, then pop it open!
    setTimeout(() => {
      setIsEnvelopeOpen(true);
    }, 600);
  };

  const closeModal = () => {
    setIsEnvelopeOpen(false);
    setTimeout(() => {
      setSelectedOrder(null);
    }, 500); // Wait for letter to slide back inside before hiding modal
  };

  const formatPrice = (baseUsdPrice: number) => {
    return `${currency.symbol}${(baseUsdPrice * currency.rate).toFixed(2)} ${currency.code !== 'USD' ? currency.code : ''}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-serif text-[#1B342B] mb-2">My Orders</h1>
          <p className="text-[#1B342B]/60 text-sm">Track your product purchases and shipping status.</p>
          <div className="mt-4 inline-block bg-[#1B342B]/5 px-4 py-1.5 rounded-full border border-[#1B342B]/10">
            <p className="text-[9px] uppercase tracking-widest font-bold text-[#A67C52]">
              Region Detected: Showing Prices in <span className="text-[#1B342B]">{currency.code} ({currency.symbol})</span>
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center p-20">
            <p className="text-[#A67C52] text-xs uppercase tracking-widest animate-pulse font-bold">Syncing Orders...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => handleOpenOrder(order)}
                className="bg-white border border-[#1B342B]/5 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-mono text-[#1B342B] font-bold">#{order.id.slice(0, 8).toUpperCase()}</h3>
                    <p className="text-xs text-[#1B342B]/50 font-mono mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold rounded-full border
                    ${order.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                      order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                  >
                    {order.status || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-end border-t border-[#1B342B]/5 pt-4 mt-2">
                   <p className="text-[10px] text-[#A67C52] font-bold uppercase tracking-widest group-hover:text-[#1B342B] transition-colors flex items-center">
                     Open Envelope <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76" /></svg>
                   </p>
                   <p className="text-xl font-bold text-[#1B342B]">{formatPrice(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- THE 3D ENVELOPE MODAL --- */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-opacity" onClick={closeModal}>
            
            {/* Perspective container is required for 3D rotation */}
            <div 
              className="relative w-full max-w-sm h-64 mx-auto mt-40 perspective-[1500px]" 
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Close Button floating outside */}
              <button onClick={closeModal} className="absolute -top-32 right-0 text-white/50 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              {/* 1. BACK OF ENVELOPE */}
              <div className="absolute inset-0 bg-[#8c6742] rounded-b-xl shadow-2xl z-0"></div>

              {/* 2. THE RECEIPT (PAPER) - Slides up when envelope opens */}
              <div 
                className={`absolute left-4 right-4 bg-[#FDFBF7] shadow-xl border border-[#1B342B]/5 p-6 rounded-t-2xl transition-all duration-[1000ms] ease-in-out z-10 flex flex-col
                  ${isEnvelopeOpen ? '-top-80 h-[380px]' : 'top-4 h-56'}`
                }
              >
                <div className="text-center mb-5 mt-2">
                  <h2 className="text-2xl font-serif text-[#1B342B] mb-1">Receipt</h2>
                  <p className="text-[10px] text-[#A67C52] font-mono tracking-widest">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                  {selectedOrder.items ? (
                    <ul className="space-y-3 mb-4">
                      {selectedOrder.items.map((item: any, i: number) => (
                        <li key={i} className="flex justify-between items-start text-xs border-b border-[#1B342B]/5 pb-3">
                          <span className="text-[#1B342B] font-medium leading-tight max-w-[180px]">
                            <span className="text-[#A67C52] font-bold mr-2">{item.qty}x</span>{item.name}
                          </span>
                          <span className="text-[#1B342B]/80 font-mono mt-0.5">{formatPrice(item.price * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#1B342B]/60 text-center mt-10">Fetching details...</p>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-[#1B342B]/10 flex justify-between items-center">
                  <span className="text-[10px] text-[#1B342B]/60 font-bold uppercase tracking-widest">Total Paid</span>
                  <span className="text-lg text-[#1B342B] font-bold">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* 3. FRONT OF ENVELOPE (POCKET) - Covers the bottom of the paper */}
              <div 
                className="absolute bottom-0 left-0 w-full h-full bg-[#A67C52] rounded-b-xl z-20 shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)]"
                style={{ clipPath: 'polygon(0 0, 50% 45%, 100% 0, 100% 100%, 0 100%)' }}
              ></div>

              {/* 4. THE TOP FLAP (Folds up and backwards) */}
              <div 
                className={`absolute top-0 left-0 w-full h-full bg-[#9c7247] shadow-lg origin-top transition-all duration-[800ms] ease-in-out
                  ${isEnvelopeOpen ? 'rotate-x-180 opacity-0 z-0' : 'rotate-x-0 opacity-100 z-30'}`
                }
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 60%)', transformStyle: 'preserve-3d' }}
              >
                {/* Red Wax Seal */}
                <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-[#7a1c1c] rounded-full flex items-center justify-center shadow-lg border-2 border-[#631414]">
                  <span className="text-[#e6cda3] font-serif text-xl italic font-bold">G</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}