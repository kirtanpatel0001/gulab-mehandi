"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { downloadInvoicePDF } from '@/lib/utils/pdf';

// --- GEO-LOCATION CURRENCY LOGIC ---
const detectUserCurrency = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('Asia/Colombo')) {
      return { code: 'INR', symbol: '₹', rate: 1 };
    }
    if (tz.includes('London') || tz.includes('Europe')) {
      return { code: 'GBP', symbol: '£', rate: 0.0095 };
    }
    if (tz.includes('Dubai') || tz.includes('Asia/Dubai')) {
      return { code: 'AED', symbol: 'د.إ', rate: 0.044 };
    }
    return { code: 'USD', symbol: '$', rate: 0.012 };
  } catch (error) {
    return { code: 'INR', symbol: '₹', rate: 1 };
  }
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track which order is currently being generated into a PDF
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  
  // Required for the hidden PDF template data binding
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  const [currency, setCurrency] = useState({ code: 'INR', symbol: '₹', rate: 1 });

  useEffect(() => {
    setCurrency(detectUserCurrency());
    
    let realtimeChannel: any;

    const fetchMyOrders = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      // FIX THE TRAP: If no session, kill the loading state BEFORE redirecting
      if (!session) {
        setLoading(false); 
        router.push('/login');
        return;
      }

      // Initial Fetch
      const { data, error } = await supabase
        .from('orders')
        .select(`*, shipping_address:user_addresses(*)`)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) console.error("Error fetching orders:", error);
      if (data) setOrders(data);
      
      setLoading(false);

      // REALTIME LISTENER: Listen for updates to orders for this user
      realtimeChannel = supabase
        .channel('public:orders')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${session.user.id}` },
          (payload) => {
            setOrders((prevOrders) => 
              prevOrders.map((o) => 
                o.id === payload.new.id ? { ...o, status: payload.new.status } : o
              )
            );
          }
        )
        .subscribe();
    };

    fetchMyOrders();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [router]);

  // --- DIRECT PDF DOWNLOAD LOGIC ---
  const handleDownloadReceipt = async (order: any) => {
    setDownloadingOrderId(order.id);
    setSelectedOrder(order); 
    
    setTimeout(async () => {
      // Prioritizes the Razorpay ID for the filename
      await downloadInvoicePDF('invoice-pdf-template', order.razorpay_order_id || order.id.slice(0, 8));
      setDownloadingOrderId(null);
      setSelectedOrder(null);
    }, 150); 
  };

  const formatPrice = (basePrice: number) => {
    return `${currency.symbol}${(basePrice * currency.rate).toFixed(2)}`;
  };

  const getProgressStep = (status: string) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'completed' || s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'processing') return 2;
    return 1;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-20 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-serif text-[#1B342B] mb-2">Order History</h1>
          <p className="text-[#1B342B]/60 text-sm">Review your past purchases and track current shipments.</p>
        </header>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-2 border-[#1B342B]/20 border-t-[#A67C52] rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center p-20 border border-[#1B342B]/10 bg-white rounded-sm">
            <p className="text-[#1B342B]/50 font-serif italic text-lg mb-4">You haven't placed any orders yet.</p>
            <button onClick={() => router.push('/shop')} className="border border-[#1B342B] px-6 py-2 text-xs uppercase tracking-widest font-bold text-[#1B342B] hover:bg-[#1B342B] hover:text-white transition-colors">
              Browse Boutique
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const currentStep = getProgressStep(order.status);
              const isCurrentlyDownloading = downloadingOrderId === order.id;
              
              return (
                <div key={order.id} className="bg-white border border-[#1B342B]/10 rounded-sm shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  
                  {/* 1. PROFESSIONAL HEADER - Shows the mock_order ID clearly */}
                  <div className="bg-[#1B342B]/5 border-b border-[#1B342B]/10 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex space-x-12">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#1B342B]/60 font-bold mb-1">Order Placed</p>
                        <p className="text-sm font-medium text-[#1B342B]">
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#1B342B]/60 font-bold mb-1">Total</p>
                        <p className="text-sm font-medium text-[#1B342B] tabular-nums">{formatPrice(order.total_amount)}</p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase tracking-widest text-[#1B342B]/60 font-bold mb-1">Order #</p>
                      <p className="text-sm font-mono text-[#1B342B]">{order.razorpay_order_id || order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>

                  {/* 2. BODY: PRODUCT DETAILS + PROGRESS TRACKER */}
                  <div className="p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    
                    <div className="flex items-center space-x-5">
                      <div className="w-16 h-16 bg-[#FDFBF7] border border-[#A67C52]/20 rounded-sm flex items-center justify-center shrink-0">
                        <svg className="w-8 h-8 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>
                      <div>
                        <p className="text-[#1B342B] font-serif text-lg">Organic Mehndi Products</p>
                        <p className="text-xs text-[#1B342B]/60 mt-1 flex items-center">
                          Status: <span className="ml-1 font-bold uppercase tracking-wider text-[#A67C52]">{order.status || 'PAID'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="w-full lg:w-1/2 mt-4 lg:mt-0 px-2 md:px-0">
                      <div className="flex items-center justify-between relative max-w-sm mx-auto lg:ml-auto lg:mr-0">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#1B342B]/10 z-0"></div>
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#A67C52] z-0 transition-all duration-1000" 
                          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                        ></div>

                        {['Ordered', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                          const stepNumber = index + 1;
                          const isActive = currentStep >= stepNumber;
                          
                          return (
                            <div key={step} className="relative z-10 flex flex-col items-center">
                              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs border-2 transition-colors duration-500
                                ${isActive ? 'bg-[#A67C52] border-[#A67C52] text-white shadow-sm' : 'bg-white border-[#1B342B]/20 text-[#1B342B]/40'}`}
                              >
                                {isActive ? <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : stepNumber}
                              </div>
                              <p className={`absolute -bottom-6 text-[8px] md:text-[9px] uppercase tracking-widest font-bold whitespace-nowrap ${isActive ? 'text-[#1B342B]' : 'text-[#1B342B]/40'}`}>
                                {step}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* 3. DIRECT DOWNLOAD ACTION BAR */}
                  <div className="px-6 py-4 bg-[#FDFBF7]/50 border-t border-[#1B342B]/5 flex justify-end">
                    <button 
                      onClick={() => handleDownloadReceipt(order)}
                      disabled={isCurrentlyDownloading}
                      className="w-full sm:w-auto bg-[#1B342B] text-white px-8 py-3 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-[#A67C52] transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isCurrentlyDownloading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <span>Download Receipt</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================== */}
        {/* BULLETPROOF HIDDEN INVOICE TEMPLATE */}
        {/* ========================================== */}
        {selectedOrder && (
          <div className="absolute top-[-9999px] left-[-9999px]">
            <div id="invoice-pdf-template" style={{ width: '800px', backgroundColor: '#ffffff', padding: '60px', color: '#1B342B', fontFamily: 'Arial, sans-serif', lineHeight: '1.6', boxSizing: 'border-box' }}>
              
              {/* HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1B342B', paddingBottom: '40px', marginBottom: '40px' }}>
                <div style={{ width: '50%' }}>
                  <h2 style={{ fontSize: '32px', margin: '0 0 12px 0', fontFamily: 'serif', letterSpacing: '1px' }}>GULAB MEHNDI</h2>
                  <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.8' }}>
                    <div style={{ display: 'block' }}>123 Heritage Art Street, Vesu</div>
                    <div style={{ display: 'block' }}>Surat, Gujarat 395007, India</div>
                    <div style={{ display: 'block', marginTop: '8px' }}><strong>GSTIN:</strong> 24ABCDE1234F1Z5</div>
                  </div>
                </div>
                <div style={{ width: '50%', textAlign: 'right' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#A67C52', textTransform: 'uppercase', margin: '0 0 20px 0', letterSpacing: '2px' }}>Tax Invoice</h1>
                  <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.8' }}>
                    <div style={{ display: 'block' }}><strong>Invoice No:</strong> {selectedOrder?.razorpay_order_id || selectedOrder?.id.slice(0,8)}</div>
                    <div style={{ display: 'block' }}><strong>Date:</strong> {new Date(selectedOrder?.created_at).toLocaleDateString('en-IN')}</div>
                    <div style={{ display: 'block' }}><strong>Payment Status:</strong> {selectedOrder.status || 'PAID'}</div>
                  </div>
                </div>
              </div>

              {/* BILLED TO */}
              {selectedOrder?.shipping_address && (
                <div style={{ marginBottom: '50px', width: '60%' }}>
                  <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#A67C52', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '16px', letterSpacing: '1px' }}>Billed To</h3>
                  <div style={{ fontSize: '14px', color: '#222', lineHeight: '1.8', wordWrap: 'break-word' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '6px' }}>{selectedOrder.shipping_address.full_name}</div>
                    <div style={{ display: 'block' }}>{selectedOrder.shipping_address.street_address}</div>
                    <div style={{ display: 'block' }}>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</div>
                    <div style={{ display: 'block' }}>{selectedOrder.shipping_address.country}</div>
                  </div>
                </div>
              )}

              {/* TABLE */}
              <div style={{ marginBottom: '50px' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '16px', fontSize: '12px', borderBottom: '2px solid #e5e7eb', width: '70%', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</th>
                      <th style={{ padding: '16px', fontSize: '12px', borderBottom: '2px solid #e5e7eb', width: '30%', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '24px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '15px', verticalAlign: 'top', lineHeight: '1.6' }}>Organic Mehndi Products & Services</td>
                      <td style={{ padding: '24px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '15px', textAlign: 'right', verticalAlign: 'top', fontWeight: '500' }}>₹{(selectedOrder?.total_amount / 1.18).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TOTALS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <div style={{ width: '65%', backgroundColor: '#f9fafb', padding: '32px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px', color: '#444' }}>
                    <span>Subtotal</span>
                    <span>₹{(selectedOrder?.total_amount / 1.18).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px', color: '#444' }}>
                    <span>IGST (18%)</span>
                    <span>₹{(selectedOrder?.total_amount - (selectedOrder?.total_amount / 1.18)).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #d1d5db', fontSize: '15px', fontWeight: 'bold', color: '#1B342B' }}>
                    <span>Grand Total</span>
                    <span>₹{selectedOrder?.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        )}

      </div>
    </div>
  );
}